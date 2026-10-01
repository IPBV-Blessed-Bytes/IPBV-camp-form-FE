import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import sitePt from './locales/site.pt.json';
import siteEn from './locales/site.en.json';
import siteEs from './locales/site.es.json';
import manualPt from './locales/manual.pt.json';
import manualEn from './locales/manual.en.json';
import manualEs from './locales/manual.es.json';

export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: { ...pt, ...sitePt, ...manualPt } },
      en: { translation: { ...en, ...siteEn, ...manualEn } },
      es: { translation: { ...es, ...siteEs, ...manualEs } },
    },
    fallbackLng: 'pt',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'app-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
