import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { isFormal } from "../utils/runtime-env";

const resources = {
  zh: require("./locales/zh.ts"),
  zh_Hant: require("./locales/zh-Hant.ts"),
  en: require("./locales/en.ts"),
  ja: require("./locales/ja.ts"),
};

export const LANG_OPTIONS = [
  {
    label: "English",
    value: "en",
    icon: "https://storage.googleapis.com/rpggo_images/diago/assets/en.png",
    pcDisplayName: "EN",
    mobileDisplayName: "EN",
  },
  {
    label: "简体中文",
    value: "zh",
    icon: "https://storage.googleapis.com/rpggo_images/diago/assets/cn.png",
    pcDisplayName: "中文",
    mobileDisplayName: "CN",
  },
];

if (!isFormal()) {
  LANG_OPTIONS.push({
    label: "繁體中文",
    value: "zh_Hant",
    icon: "https://storage.googleapis.com/rpggo_images/diago/assets/cn.png",
    pcDisplayName: "繁體",
    mobileDisplayName: "TW",
  });
}

if (!isFormal()) {
  LANG_OPTIONS.push({
    label: "日本語",
    value: "ja",
    icon: "https://storage.googleapis.com/rpggo_images/diago/assets/en.png",
    pcDisplayName: "日本語",
    mobileDisplayName: "JA",
  });
}

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    // debug: true,
    resources,
    lng: "en",
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
