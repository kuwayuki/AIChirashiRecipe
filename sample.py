import base64
from datetime import datetime, timedelta
import os
import io
import traceback
import boto3
from PIL import Image, ImageOps
import hashlib

# LangChain のインポート
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain, SequentialChain

OUTPUT_S3 = False
BUCKET_NAME = "ianswer1c0febcad18d444ca1fb391b19a950abb6a53-dev"
# PROVIDER = "openai"
PROVIDER = "gemini"
GPT_MODEL = None
RESIZE_SIZE = 0

s3 = boto3.client("s3")


def lambda_handler(event, context):
    start = datetime.now()
    print("----------------------------------------")
    print(f"Start: {start}")

    result = main(event, context)

    end = datetime.now()
    duration = end.timestamp() - start.timestamp()
    print(f"End: {end}")
    print(f"Duration: {int(duration)} seconds")
    print("----------------------------------------")
    return result


def main(event, context):
    try:
        print(event)

        # 認証用の日付チェック
        today = datetime.utcnow()
        date_strings = [
            today.strftime("%Y-%m-%d"),
            (today - timedelta(days=1)).strftime("%Y-%m-%d"),
            (today + timedelta(days=1)).strftime("%Y-%m-%d"),
        ]
        valid_base64_dates = [
            base64.b64encode(date_str.encode()).decode() for date_str in date_strings
        ]
        authorization_header = event.get("Authorization", "")
        received_auth = event.get("auth", "")
        if not verify_hmac(received_auth) and (
            not authorization_header
            or authorization_header.split(" ")[1] not in valid_base64_dates
        ):
            return {"statusCode": 500, "body": "Unauthorized"}

        # S3 から画像データを取得
        s3Request = {"Bucket": BUCKET_NAME, "Key": event["key"]}
        print("S3からデータを取得します。")
        s3Object = s3.get_object(**s3Request)
        print("S3からデータを取得しました。")
        objectBytes = s3Object["Body"].read()

        # 必要に応じて画像のリサイズ
        if RESIZE_SIZE > 0:
            resized_image_bytes = resize_image(
                objectBytes, (RESIZE_SIZE, RESIZE_SIZE), event["key"]
            )
            base64_image = encode_image(resized_image_bytes, event["key"])
            print(f"Resized image size: {len(resized_image_bytes)} bytes")
        else:
            base64_image = encode_image(objectBytes, event["key"])

        # LangChain を利用して画像解析（プロンプトと画像を渡す）
        summary = analyze_image_with_langchain(base64_image, event)
        print(summary)
        return {"statusCode": 200, "body": summary}

    except Exception as e:
        print(traceback.format_exc())
        return {"statusCode": 500, "body": ""}


def encode_image(objectBytes, img_file_path):
    mime_type = get_mime_type(img_file_path)
    base64_image = (
        f"data:{mime_type};base64,{base64.b64encode(objectBytes).decode('utf-8')}"
    )
    return base64_image


def get_mime_type(file_path: str) -> str:
    mime_types = {
        ".pdf": "application/pdf",
        ".gif": "image/gif",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".bmp": "image/bmp",
        ".webp": "image/webp",
    }
    ext = os.path.splitext(file_path)[1].lower()
    return mime_types.get(ext, "image/jpeg")


def resize_image(image_bytes, max_size, img_file_path, quality=70):
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img.thumbnail(max_size, Image.LANCZOS)
        mime_type = get_mime_type(img_file_path)
        format_map = {
            "application/pdf": "PDF",
            "image/gif": "GIF",
            "image/tiff": "TIFF",
            "image/jpeg": "JPEG",
            "image/png": "PNG",
            "image/bmp": "BMP",
            "image/webp": "WEBP",
        }
        img_format = format_map.get(mime_type, "JPEG")
        with io.BytesIO() as output:
            img.save(output, format=img_format)
            if OUTPUT_S3:
                output.seek(0)
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key="public/resize.jpg",
                    Body=output,
                    ContentType="image/jpeg",
                )
            return output.getvalue()


def verify_hmac(received_hmac):
    todayUtc = datetime.utcnow().isoformat().split("T")[0]
    hash = generate_sha256_hash(todayUtc + "KUWAKUWA_@TENSAI")
    return received_hmac == hash


def generate_sha256_hash(message):
    return hashlib.sha256(message.encode()).hexdigest()


# LangChain を用いた画像解析処理
def analyze_image_with_langchain(image_base64: str, event) -> str:

    current_date = datetime.now().strftime(
        "%Y-%m-%d"
    )  # 今日の日付を'YYYY-MM-DD'形式で変数に格納    # イベントからプロンプト（ユーザー側・システム側）を取得
    prompt = event.get(
        "promptUser",
        f"あなたはプロの料理人であり、調理栄養士でもあります。\r\n記載されている食材から利用したレシピを5つ、使用材料と調理方法も含めて教えてください。\r\n・markdown形式のみの返却で余計な返答や文言は不要です。\r\n・使用材料がちらしに掲載されている場合はmd記法の太字で、食材名、価格、数量、（販売日が決まっている場合のみ日付も）を記載してください。\r\n・調味料などを使う場合は具体的な容量やグラム数などを調理方法に記載してください。\r\n・今日は${current_date}なので日付が過ぎている食材は対象外です。",
    )
    provider = os.environ.get("PROVIDER", PROVIDER)
    model = os.environ.get("GPT_MODEL", GPT_MODEL)

    llm = get_llm(provider=provider, model=model)

    # システムメッセージと、人間側のメッセージ（テキスト＋画像）を作成
    human_content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": image_base64}},
    ]
    human_message = HumanMessage(content=human_content)

    # LangChain の LLM を呼び出し、レスポンスを取得
    response = llm.invoke([human_message])

    # 取得したレスポンスを別のAIで評価
    evaluation_prompt = f"以下の内容を評価してください:\n\n{response.content}"
    evaluation_llm = get_llm(provider=provider, model=model)
    evaluation_response = evaluation_llm.invoke([HumanMessage(content=[{"type": "text", "text": evaluation_prompt}])])

    return evaluation_response.content


def get_llm(
    provider: str = None, model: str = None, reasoning_effort: str = None, **kwargs
):
    # provider が未指定の場合は "gemini" をデフォルトとする
    if not provider:
        provider = "gemini"
        # provider = "openai"
    # model が未指定の場合、provider に応じたデフォルト値を設定する
    if not model:
        if provider == "openai":
            model = "gpt-4o"
        elif provider == "gemini":
            model = "gemini-2.0-flash"

    print(f"provider: {provider}, model: {model}")
    if provider == "openai":
        return ChatOpenAI(
            model=model,
            reasoning_effort=reasoning_effort,
            **kwargs,
        )
    elif provider == "gemini":
        return ChatGoogleGenerativeAI(model=model, **kwargs)
    else:
        raise ValueError(f"Unknown provider: {provider}")


def get_chain(
    prompt_str: str, output_key: str, provider: str = None, model: str = None, **kwargs
):
    llm_instance = get_llm(provider, model=model, **kwargs)
    return create_chain(llm_instance, prompt_str, output_key)

def create_chain(llm, prompt_str: str, output_key: str):
    prompt_template = ChatPromptTemplate.from_messages([("human", prompt_str)])
    return LLMChain(llm=llm, prompt=prompt_template, output_key=output_key)

def sequentialChain(
    topic: str,
    provider: str = None,
    model: str = None,
):
    chains = []  # チェーンを格納するリスト
    chains.append(
        get_chain(
            provider,
            model,
            prompt_str="以下のトピックについて、初心者にも分かるように簡単に説明してください: {topic}",
            output_key="explanation",
        )
    )

    chains.append(
        get_chain(
            provider,
            model,
            prompt_str="上記の説明を踏まえて、関連する具体例を一つ挙げてください。説明: {explanation}",
            output_key="example",
        )
    )

    # 2つのチェーンを連結して SequentialChain を作成
    overall_chain = SequentialChain(
        chains=chains,
        input_variables=["topic"],
        output_variables=["explanation", "example"],
    )

    result = overall_chain.invoke({"topic": topic})
    print(result["explanation"])
    print(result["example"])
