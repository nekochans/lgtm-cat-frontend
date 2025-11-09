// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { IncludeLanguageAppPath } from "@/features/url";

export const languages = ["en", "ja"] as const;

export type Language = (typeof languages)[number];

export function removeLanguageFromAppPath(
  appPath: IncludeLanguageAppPath
): IncludeLanguageAppPath {
  let newUrlPath: string = appPath;

  for (const language of languages) {
    newUrlPath = newUrlPath.replace(`/${language}`, "");
  }

  if (newUrlPath === "") {
    return "/";
  }

  return newUrlPath as IncludeLanguageAppPath;
}

export function isLanguage(value: unknown): value is Language {
  return languages.includes(value as Language);
}

export function mightExtractLanguageFromAppPath(
  appPath: IncludeLanguageAppPath
): Language | null {
  const languageRegex = new RegExp(`/(${languages.join("|")})(/|$)`);
  const match = appPath.match(languageRegex);

  if (match?.[1] != null && isLanguage(match[1])) {
    return match[1];
  }

  return null;
}
