import { post } from "@aws-amplify/api";
import { ApiBodyType } from "../App";
import * as Crypto from "expo-crypto";

const API_NAME = "IAnswer";
const SECRET = "KUWAKUWA_@TENSAI";
const API_URL = {
  uploadS3Result: "/image/chirashi",
};

const hashCurrentDay = async (): Promise<string> => {
  const today = new Date().toISOString().split("T")[0];
  let hash;
  hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    today + SECRET,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return hash;
};

export const aiAnswer = async (
  filePath: string,
  PromptUser?: string
): Promise<any> => {
  const hash = await hashCurrentDay();
  const result = await post({
    apiName: API_NAME,
    path: API_URL.uploadS3Result,
    options: {
      body: {
        key: filePath,
        promptUser: PromptUser,
        auth: `${hash}`,
      } as ApiBodyType,
    },
  }).response;
  return result;
};
