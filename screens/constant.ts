import { ReactNode } from "react";
import IconAtom from "./IconAtom";
import { IconProps } from "react-native-elements";
import { i18n } from "./locales/i18n";

export const MAX_LIMIT = {
  ADMOB: 5,
};

export const BANNER_UNIT_ID = {
  INTERSTIAL: "ca-app-pub-2103807205659646/7144826991",
  INTERSTIAL_MOVIE: "ca-app-pub-2103807205659646/1595318544",
  // INTERSTIAL_2: "ca-app-pub-2103807205659646/2139213606",
  // INTERSTIAL_3: "ca-app-pub-2103807205659646/4180737796",
  BANNER: "ca-app-pub-2103807205659646/2489930950",
  BANNER_2: "ca-app-pub-2103807205659646/7198202853",
  BANNER_3: "ca-app-pub-2103807205659646/2824972871",
  BANNER_4: "ca-app-pub-2103807205659646/2489930950",
  BANNER_5: "ca-app-pub-2103807205659646/7198202853",
  BANNER_6: "ca-app-pub-2103807205659646/2824972871",
  BANNER_7: "ca-app-pub-2103807205659646/2489930950",
  BANNER_8: "ca-app-pub-2103807205659646/7198202853",
  BANNER_9: "ca-app-pub-2103807205659646/2824972871",
  APP_OPEN_1: "ca-app-pub-2103807205659646/8616355606",
  REWARD_INTERSTIAL_1: "ca-app-pub-2103807205659646/9929437279",
};

export type PROMPT_TEMPLATE = {
  No: number;
  Title: string;
  PromptUser?: string;
  PromptSystem?: string;
  AppName: string;
  Explane?: string;
  ShortExplane?: string;
  Icon?: () => JSX.Element;
};

const PROPMT_SYSTEM = i18n.t("propmpt_system");

const CustomPromptUser = (
  name: string,
  result: string,
  title?: string,
  body?: string,
  answer?: string,
  explanation?: string
) => {
  return i18n.t("custom_prompt_user", {
    name: name,
    result: result ? result : "null",
    title: title ? title : "null",
    body: body ? body : "null",
    answer: answer ? answer : "null",
    explanation: explanation ? explanation : "null",
  });
};
const COMMON_ICON_PROPS = {
  style: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    margin: 1,
    padding: 0,
  },
  containerStyle: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    margin: 1,
    padding: 0,
  },
  iconStyle: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    maxWidth: 22,
    margin: 1,
    padding: 0,
  },
} as IconProps;

const DETAIL_OR_EASY = i18n.t("detail_or_easy");
// 共通のテンプレート作成関数
const createTemplate = (
  no: number,
  appName: string,
  titleKey: string,
  iconName: string,
  iconType: string
): PROMPT_TEMPLATE => ({
  No: no,
  AppName: appName,
  Title: i18n.t(`mode.${titleKey}`),
  Icon: () =>
    IconAtom({
      ...COMMON_ICON_PROPS,
      name: iconName,
      type: iconType,
    } as IconProps),
  Explane: i18n.t(`explane.${titleKey}`),
  ShortExplane: i18n.t(`short_explane.${titleKey}`),
  PromptUser: i18n.t(`prompt_user_descriptions.${titleKey}`, {
    detail_or_easy: DETAIL_OR_EASY,
  }),
});

export const PROMPT_TEMPLATES = {
  TEST: createTemplate(
    1,
    "AIChirashiRecipe",
    "test",
    "book-open-variant",
    "material-community"
  ),
};
