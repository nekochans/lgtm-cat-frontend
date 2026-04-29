import { languages } from "@/constants/language";
import { appPathList } from "@/constants/url";
import type { Language } from "@/types/language";
import type { AppPathName, IncludeLanguageAppPath, Url } from "@/types/url";

const HTTPS_PREFIX = "https://";
const LOCALHOST_PREFIX = "http://localhost";

export function isUrl(value: unknown): value is Url {
  if (typeof value !== "string") {
    return false;
  }

  return value.startsWith(HTTPS_PREFIX) || value.startsWith(LOCALHOST_PREFIX);
}

export function isIncludeLanguageAppPath(
  value: unknown
): value is IncludeLanguageAppPath {
  const appPaths: string[] = Object.values(appPathList);

  if (typeof value !== "string") {
    return false;
  }

  if (value === "/") {
    return true;
  }

  if (languages.some((language) => value === `/${language}`)) {
    return true;
  }

  if (
    languages.some((language) =>
      appPaths.some((path) => value === `/${language}${path}`)
    )
  ) {
    return true;
  }

  if (appPaths.includes(value)) {
    return true;
  }

  return false;
}

export function createIncludeLanguageAppPath(
  appPathName: AppPathName,
  language: Language
): IncludeLanguageAppPath {
  if (appPathName === "home" && language === "en") {
    return `/${language}`;
  }

  return language === "en"
    ? (`/en${appPathList[appPathName]}` as const)
    : appPathList[appPathName];
}
