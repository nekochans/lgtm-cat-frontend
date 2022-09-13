import { languages, type Language } from './language';

const locales = languages;

export type Locale = typeof locales[number];

const isLocale = (value: unknown): value is Locale => {
  if (typeof value !== 'string') {
    return false;
  }

  return locales.includes(value as Locale);
};

export const convertLocaleToLanguage = (locale: unknown): Language => {
  if (isLocale(locale)) {
    return locale;
  }

  return 'ja';
};
