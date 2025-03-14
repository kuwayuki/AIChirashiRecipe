import { ReactNode } from "react";
import IconAtom from "./IconAtom";
import { IconProps } from "react-native-elements";
import { i18n } from "./locales/i18n";

export const MAX_LIMIT = {
  ADMOB: 5,
};

export const BANNER_UNIT_ID = {
  INTERSTIAL: "ca-app-pub-2103807205659646/7025650068",
  INTERSTIAL_MOVIE: "ca-app-pub-2103807205659646/1735973989",
  // INTERSTIAL_2: "ca-app-pub-2103807205659646/2139213606",
  // INTERSTIAL_3: "ca-app-pub-2103807205659646/4180737796",
  BANNER: "ca-app-pub-2103807205659646/3853773383",
  BANNER_2: "ca-app-pub-2103807205659646/3715270066",
  BANNER_3: "ca-app-pub-2103807205659646/6582188129",
  BANNER_4: "ca-app-pub-2103807205659646/1549353293",
  BANNER_5: "ca-app-pub-2103807205659646/5269106455",
  BANNER_6: "ca-app-pub-2103807205659646/2402188395",
  BANNER_7: "ca-app-pub-2103807205659646/3136685568",
  BANNER_8: "ca-app-pub-2103807205659646/1823603890",
  BANNER_9: "ca-app-pub-2103807205659646/9236271621",
  APP_OPEN_1: "ca-app-pub-2103807205659646/1199351237",
  REWARD_INTERSTIAL_1: "ca-app-pub-2103807205659646/6244310618",
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
  ALL: {
    No: 0,
    AppName: "IAnswer",
    Title: i18n.t("all"),
  } as PROMPT_TEMPLATE,
  TEST: createTemplate(
    1,
    "IAnswerTest",
    "test",
    "book-open-variant",
    "material-community"
  ),
  TRANSLATE: createTemplate(
    2,
    "IAnswerTranslate",
    "translate",
    "google-translate",
    "material-community"
  ),
  STUDY_NOTES: createTemplate(
    14,
    "IAnswerStudyNotes",
    "study_notes",
    "notebook-outline",
    "material-community"
  ),
  DIARY: createTemplate(
    12,
    "IAnswerDiary",
    "diary",
    "notebook",
    "material-community"
  ),
  SNS: createTemplate(
    13,
    "IAnswerSNS",
    "sns",
    "share-variant",
    "material-community"
  ),
  DAILY_MOOD: createTemplate(
    15,
    "IAnswerDailyMood",
    "daily_mood",
    "emoticon-happy-outline",
    "material-community"
  ),
  OOGIRI: createTemplate(
    17,
    "IAnswerOogiri",
    "oogiri",
    "emoticon-excited-outline",
    "material-community"
  ),
  TRASH: createTemplate(
    6,
    "IAnswerTrash",
    "trash",
    "trash-can",
    "material-community"
  ),
  RECEPI: createTemplate(
    4,
    "IAnswerRecepi",
    "recipe",
    "silverware-fork-knife",
    "material-community"
  ),
  CALORY: createTemplate(
    5,
    "IAnswerCalory",
    "calory",
    "scale",
    "material-community"
  ),
  MEAL_JUDGEMENT: createTemplate(
    16,
    "IAnswerMealJudgement",
    "meal_judgement",
    "food",
    "material-community"
  ),
  FASSION: createTemplate(
    3,
    "IAnswerFassion",
    "fashion",
    "tshirt-v",
    "material-community"
  ),
  FACE_REVIEW: createTemplate(
    8,
    "IAnswerFace",
    "face_review",
    "face-retouching-natural",
    "material"
  ),
  HAIR_REVIEW: createTemplate(
    9,
    "IAnswerHair",
    "hair_review",
    "face-man-profile",
    "material-community"
  ),
  MAKE_REVIEW: createTemplate(
    10,
    "IAnswerFace",
    "makeup_review",
    "face-woman-outline",
    "material-community"
  ),
  PLANTS: createTemplate(
    7,
    "IAnswerPlants",
    "plants",
    "flower-tulip",
    "material-community"
  ),
  PROGRAM: createTemplate(
    11,
    "IAnswerProgram",
    "program",
    "computer",
    "material"
  ),
};
