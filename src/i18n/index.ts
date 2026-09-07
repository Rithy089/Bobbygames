import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import km from './km';
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, km: { translation: km } },
  lng: document.documentElement.lang === 'km' ? 'km' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
export default i18n;
