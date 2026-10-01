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
import adminPt from './locales/admin.pt.json';
import adminEn from './locales/admin.en.json';
import adminEs from './locales/admin.es.json';
import adminCorePt from './locales/admin-core.pt.json';
import adminCoreEn from './locales/admin-core.en.json';
import adminCoreEs from './locales/admin-core.es.json';
import adminFormsPt from './locales/admin-forms.pt.json';
import adminFormsEn from './locales/admin-forms.en.json';
import adminFormsEs from './locales/admin-forms.es.json';
import adminRegistrationsPt from './locales/admin-registrations.pt.json';
import adminRegistrationsEn from './locales/admin-registrations.en.json';
import adminRegistrationsEs from './locales/admin-registrations.es.json';
import adminCommercePt from './locales/admin-commerce.pt.json';
import adminCommerceEn from './locales/admin-commerce.en.json';
import adminCommerceEs from './locales/admin-commerce.es.json';
import adminLogisticsPt from './locales/admin-logistics.pt.json';
import adminLogisticsEn from './locales/admin-logistics.en.json';
import adminLogisticsEs from './locales/admin-logistics.es.json';

export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es'];

const deepMerge = (target, source) => {
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
};

const merge = (...objects) => objects.reduce((acc, object) => deepMerge(acc, object), {});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translation: merge(
          pt,
          sitePt,
          manualPt,
          adminPt,
          adminCorePt,
          adminFormsPt,
          adminRegistrationsPt,
          adminCommercePt,
          adminLogisticsPt,
        ),
      },
      en: {
        translation: merge(
          en,
          siteEn,
          manualEn,
          adminEn,
          adminCoreEn,
          adminFormsEn,
          adminRegistrationsEn,
          adminCommerceEn,
          adminLogisticsEn,
        ),
      },
      es: {
        translation: merge(
          es,
          siteEs,
          manualEs,
          adminEs,
          adminCoreEs,
          adminFormsEs,
          adminRegistrationsEs,
          adminCommerceEs,
          adminLogisticsEs,
        ),
      },
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
