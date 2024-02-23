import type { IncludeLanguageAppPath } from '@/features/url';

export const languages = ['en', 'ja'] as const;

export type Language = (typeof languages)[number];

export const removeLanguageFromUrlPath = (
  urlPath: IncludeLanguageAppPath,
): IncludeLanguageAppPath => {
  let newUrlPath: string = urlPath;

  languages.forEach((language) => {
    newUrlPath = newUrlPath.replace(`/${language}`, '');
  });

  if (newUrlPath === '') {
    return '/';
  }

  return newUrlPath as IncludeLanguageAppPath;
};

export const isLanguage = (value: unknown): value is Language => {
  return languages.includes(value as Language);
};

export const mightExtractLanguageFromUrlPath = (
  urlPath: IncludeLanguageAppPath,
): Language | null => {
  const languageRegex = new RegExp(`/(${languages.join('|')})(/|$)`);
  const match = urlPath.match(languageRegex);

  if (match?.[1] != null) {
    if (isLanguage(match[1])) {
      return match[1];
    }
  }

  return null;
};
