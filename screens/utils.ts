import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { MAX_LIMIT } from "./constant";

export const KEY = {
  AI_TYPE: "AI_TYPE",
  INITIAL_READ: "INITIAL_READ",
  LAST_EXECUTED_AD: "LAST_EXECUTED_AD",
  EXECUTED_COUNT: "EXECUTED_COUNT",
  DEBUG_MODE: "DEBUG_MODE",
  POINTS_LIMIT: "POINTS_LIMIT",
  INIT_REVIEW: "INIT_REVIEW",
  HISTORY_LIST: "HISTORY_LIST2",
  LINK_AD: "LINK_AD",
  IMAGE_PHOTO: "IMAGE_PHOTO",
};

export const DEBUG_MODE = {
  GENERAL: 1,
  SUB_PREMIUM: 2,
  PREMIUM: 3,
};

export const getLocalStorage = async (
  key: string
): Promise<string | undefined | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (err) {}
  return undefined;
};

export const saveLocalStorage = async (key: string, value: string | number) => {
  try {
    await AsyncStorage.setItem(
      key,
      typeof value === "string" ? value : String(value)
    );
  } catch (err) {
    console.error(err);
  }
};

export const getLocalStorageSecure = async (
  key: string
): Promise<string | undefined | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (err) {}
  return undefined;
};

export const saveLocalStorageSecure = async (
  key: string,
  value: string | number
) => {
  try {
    await SecureStore.setItemAsync(
      key,
      typeof value === "string" ? value : String(value)
    );
  } catch (err) {
    console.error(err);
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const checkOverMaxLimit = async (): Promise<boolean> => {
  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const storedDate = await getLocalStorageSecure(KEY.LAST_EXECUTED_AD);
  const storedCount = await getLocalStorageSecure(KEY.EXECUTED_COUNT);

  if (currentDate !== storedDate) {
    // 日付が変わっている場合、カウントをリセット
    await saveLocalStorageSecure(KEY.LAST_EXECUTED_AD, currentDate);
    await saveLocalStorageSecure(KEY.EXECUTED_COUNT, 1);
    return false;
  } else if (storedCount && parseInt(storedCount, 10) < MAX_LIMIT.ADMOB) {
    await saveLocalStorageSecure(
      KEY.EXECUTED_COUNT,
      parseInt(storedCount, 10) + 1
    );
    return false;
  } else {
    return true;
  }
};

export const checkOverMaxLimitPoints = async (): Promise<boolean> => {
  const storedCount = await getLocalStorageSecure(KEY.POINTS_LIMIT);
  const count = storedCount != null ? Number(storedCount) : 0;
  if (count > 0) {
    return false;
  } else {
    return true;
  }
};

export const pointsChange = async (count: number = 1): Promise<void> => {
  const storedCount = await getLocalStorageSecure(KEY.POINTS_LIMIT);
  if (storedCount) {
    await saveLocalStorageSecure(
      KEY.POINTS_LIMIT,
      parseInt(storedCount, 10) + count
    );
  } else {
    await saveLocalStorageSecure(KEY.POINTS_LIMIT, count);
  }
};

export const pointsService = async (
  isFirstPresent = false,
  count?: number
): Promise<void> => {
  try {
    const storedCount = await getLocalStorageSecure(KEY.POINTS_LIMIT);
    if ((isFirstPresent && storedCount == null) || !isFirstPresent)
      await pointsChange(count);
  } catch (error) {}
};

export const returnMaxLimit = async (): Promise<void> => {
  const storedCount = await getLocalStorage(KEY.EXECUTED_COUNT);
  if (storedCount) {
    await saveLocalStorage(KEY.EXECUTED_COUNT, parseInt(storedCount, 10) - 1);
  }
};
