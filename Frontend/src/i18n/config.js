import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import deCommon from './locales/de/common.json';
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import frCommon from './locales/fr/common.json';
import itCommon from './locales/it/common.json';
import nlCommon from './locales/nl/common.json';
import ruCommon from './locales/ru/common.json';
import zhCNCommon from './locales/zh-CN/common.json';
import {
  defaultLanguage,
  enabledLanguageCodes,
  getLanguageByCode,
  languageCodes,
} from './languages';

const storedLanguage = window.localStorage.getItem('yogo.language');
const initialLanguage = enabledLanguageCodes.includes(storedLanguage)
  ? storedLanguage
  : defaultLanguage;
document.documentElement.lang = initialLanguage;
document.documentElement.dir = getLanguageByCode(initialLanguage).direction;

i18n.use(initReactI18next).init({
  resources: {
    de: {
      common: deCommon,
    },
    en: {
      common: enCommon,
    },
    es: {
      common: esCommon,
    },
    fr: {
      common: frCommon,
    },
    it: {
      common: itCommon,
    },
    nl: {
      common: nlCommon,
    },
    ru: {
      common: ruCommon,
    },
    'zh-CN': {
      common: zhCNCommon,
    },
  },
  lng: initialLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: languageCodes,
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

i18n.on('languageChanged', (languageCode) => {
  const language = getLanguageByCode(languageCode);
  window.localStorage.setItem('yogo.language', language.code);
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.direction;
});

export default i18n;
