export const languages = ['en', 'ja'] as const;

export type Language = (typeof languages)[number];

export const removeLanguageFromUrlPath = (urlPath: string): string => {
  const languageRegex = new RegExp(`/(?:${languages.join('|')})(/|$)`, 'g');

  return urlPath.replace(languageRegex, '$1');
};

export const isLanguage = (value: unknown): value is Language => {
  return languages.includes(value as Language);
};

export const mightExtractLanguageFromUrlPath = (
  urlPath: string,
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
