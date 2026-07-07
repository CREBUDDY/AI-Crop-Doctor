import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import hiTranslation from '../locales/hi/translation.json';
import mrTranslation from '../locales/mr/translation.json';
import bnTranslation from '../locales/bn/translation.json';
import taTranslation from '../locales/ta/translation.json';
import teTranslation from '../locales/te/translation.json';
import guTranslation from '../locales/gu/translation.json';
import knTranslation from '../locales/kn/translation.json';
import paTranslation from '../locales/pa/translation.json';
import mlTranslation from '../locales/ml/translation.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  mr: { translation: mrTranslation },
  bn: { translation: bnTranslation },
  ta: { translation: taTranslation },
  te: { translation: teTranslation },
  gu: { translation: guTranslation },
  kn: { translation: knTranslation },
  pa: { translation: paTranslation },
  ml: { translation: mlTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'pa', 'ml'],
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
