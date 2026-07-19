import { languages } from "@/constants/language";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

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

/**
 * アプリ内パスを指定した言語のパスに変換する。
 * 例: "/upload" + "en" → "/en/upload"、"/en/upload" + "ja" → "/upload"
 */
export function switchLanguageInAppPath(
  appPath: IncludeLanguageAppPath,
  language: Language
): IncludeLanguageAppPath {
  const removedLanguagePath = removeLanguageFromAppPath(appPath);

  if (language === "ja") {
    return removedLanguagePath;
  }

  if (removedLanguagePath === "/") {
    return `/${language}`;
  }

  return `/${language}${removedLanguagePath}` as IncludeLanguageAppPath;
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
