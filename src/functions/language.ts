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
