import { getLocales, getCalendars } from "expo-localization";
import ja from "./ja/translation.json";
import en from "./en/translation.json";
import { I18n } from "i18n-js";

// Set the key-value pairs for the different languages you want to support.

export const i18n = new I18n({});

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? "ja";

export const {
  languageTag,
  languageCode,
  textDirection,
  digitGroupingSeparator,
  decimalSeparator,
  measurementSystem,
  currencyCode,
  currencySymbol,
  regionCode,
} = getLocales()[0];

export const { calendar, timeZone, uses24hourClock, firstWeekday } =
  getCalendars()[0];

i18n.translations = { ja, en };
