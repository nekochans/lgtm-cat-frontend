export const languages = ['en', 'ja'] as const;

export type Language = (typeof languages)[number];

export const removeLanguageFromUrlPath = (urlPath: string): string => {
  const languageRegex = new RegExp(`/(?:${languages.join('|')})(/|$)`, 'g');

  return urlPath.replace(languageRegex, '$1');
};
