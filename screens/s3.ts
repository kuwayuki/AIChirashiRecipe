import { getProperties, list, uploadData } from "@aws-amplify/storage";
import Constants from "expo-constants";

const AWS = require("aws-sdk");
const BUCKET_NAME = "ianswer1c0febcad18d444ca1fb391b19a950abb6a53-dev";

const awsAccessKeyId = Constants.expoConfig?.extra?.eas.awsAccessKeyId;
const awsSecretAccessKey = Constants.expoConfig?.extra?.eas.awsSecretAccessKey;
// 認証情報の設定
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_ACCESS_KEY,
  secretAccessKey: process.env.EXPO_PUBLIC_SECRET_KEY,
  region: "ap-northeast-1",
});
// S3クライアントの作成
const s3 = new AWS.S3();

// ファイルをS3にアップロードする関数
export const uploadFile = async (fileContent: any, filePath: string) => {
  // alert(awsAccessKeyId);
  // alert(awsSecretAccessKey);
  const params = {
    Bucket: BUCKET_NAME,
    Key: filePath,
    Body: fileContent,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
  } catch (error) {
    console.error(`Error uploading file: ${error}`);
  }
};

// ファイルをダウンロードする関数
export const downloadFile = async (downloadPath: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: downloadPath,
  };

  try {
    const data = await s3.getObject(params).promise();
    // fs.writeFileSync(downloadPath, data.Body.toString());
    console.log(`File downloaded successfully to ${downloadPath}`);
  } catch (error) {
    console.error(`Error downloading file: ${error}`);
  }
};

// ファイルをS3にアップロードする関数
export const uploadFileAmplify = async (data: Blob, filePath: string) => {
  await uploadData({
    data: data,
    path: filePath,
    options: {
      onProgress: ({ transferredBytes, totalBytes }) => {
        if (totalBytes) {
          console.log(
            `Upload progress ${Math.round(
              (transferredBytes / totalBytes) * 100
            )} %`
          );
        }
      },
    },
  }).result;
};

// ファイルをS3からダウンロードする関数
export const downloadFileAmplify = async () => {
  const resultDownload = await getProperties({
    path: "public/test.jpg",
  });
  try {
    // const result = await getProperties({
    //   // `identityId` will provide the ID of the currently authenticated user
    //   path: ({ identityId }) => `private/${identityId}/album/2024/1.jpg`,
    // });

    const result = await list({ path: "public/" });
    console.log(result);
  } catch (error) {
    console.log("errorA");
    console.error(error);
  }
};
