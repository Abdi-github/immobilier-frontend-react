import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enProperties from './locales/en/properties.json';
import enSearch from './locales/en/search.json';
import enAgencies from './locales/en/agencies.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';

import frCommon from './locales/fr/common.json';
import frHome from './locales/fr/home.json';
import frProperties from './locales/fr/properties.json';
import frSearch from './locales/fr/search.json';
import frAgencies from './locales/fr/agencies.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';

import deCommon from './locales/de/common.json';
import deHome from './locales/de/home.json';
import deProperties from './locales/de/properties.json';
import deSearch from './locales/de/search.json';
import deAgencies from './locales/de/agencies.json';
import deAuth from './locales/de/auth.json';
import deDashboard from './locales/de/dashboard.json';

import itCommon from './locales/it/common.json';
import itHome from './locales/it/home.json';
import itProperties from './locales/it/properties.json';
import itSearch from './locales/it/search.json';
import itAgencies from './locales/it/agencies.json';
import itAuth from './locales/it/auth.json';
import itDashboard from './locales/it/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    properties: enProperties,
    search: enSearch,
    agencies: enAgencies,
    auth: enAuth,
    dashboard: enDashboard,
  },
  fr: {
    common: frCommon,
    home: frHome,
    properties: frProperties,
    search: frSearch,
    agencies: frAgencies,
    auth: frAuth,
    dashboard: frDashboard,
  },
  de: {
    common: deCommon,
    home: deHome,
    properties: deProperties,
    search: deSearch,
    agencies: deAgencies,
    auth: deAuth,
    dashboard: deDashboard,
  },
  it: {
    common: itCommon,
    home: itHome,
    properties: itProperties,
    search: itSearch,
    agencies: itAgencies,
    auth: itAuth,
    dashboard: itDashboard,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de', 'it'],
    defaultNS: 'common',
    ns: ['common', 'home', 'properties', 'search', 'agencies', 'auth', 'dashboard'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
