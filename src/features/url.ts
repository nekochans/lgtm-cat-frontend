// 絶対厳守：編集前に必ずAI実装ルールを読む
import { type Language, languages } from "./language";

const HTTPS_PREFIX = "https://";
const LOCALHOST_PREFIX = "http://localhost";

export type Url = `http://localhost${string}` | `https://${string}`;

export function isUrl(value: unknown): value is Url {
  if (typeof value !== "string") {
    return false;
  }

  return value.startsWith(HTTPS_PREFIX) || value.startsWith(LOCALHOST_PREFIX);
}

const defaultAppUrl = "https://lgtmeow.com";

export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return defaultAppUrl;
}

export const appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
  "docs-how-to-use": "/docs/how-to-use",
  "docs-mcp": "/docs/mcp",
} as const;

export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "docs-how-to-use"
  | "docs-mcp";

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";

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

export const appUrlList = {
  home: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/opengraph-image.png` as const,
  upload: `${appBaseUrl()}${appPathList.upload}` as const,
  terms: `${appBaseUrl()}${appPathList.terms}` as const,
  privacy: `${appBaseUrl()}${appPathList.privacy}` as const,
  maintenance: `${appBaseUrl()}${appPathList.maintenance}` as const,
  externalTransmission:
    `${appBaseUrl()}${appPathList["external-transmission-policy"]}` as const,
  login: `${appBaseUrl()}${appPathList.login}` as const,
  docsHowToUse: `${appBaseUrl()}${appPathList["docs-how-to-use"]}` as const,
  docsMcp: `${appBaseUrl()}${appPathList["docs-mcp"]}` as const,
} as const;

type I18nUrlList = {
  [key in AppPathName]: {
    [childrenKey in Language]: string;
  };
};

export const i18nUrlList: I18nUrlList = {
  home: {
    ja: "/",
    en: "/en/",
  },
  upload: {
    ja: `${appPathList.upload}/`,
    en: `/en${appPathList.upload}/`,
  },
  terms: {
    ja: `${appPathList.terms}/`,
    en: `/en${appPathList.terms}/`,
  },
  privacy: {
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  maintenance: {
    ja: `${appPathList.maintenance}/`,
    en: `/en${appPathList.maintenance}/`,
  },
  "external-transmission-policy": {
    ja: `${appPathList["external-transmission-policy"]}/`,
    en: `/en${appPathList["external-transmission-policy"]}/`,
  },
  login: {
    ja: `${appPathList.login}/`,
    en: `/en${appPathList.login}/`,
  },
  "docs-how-to-use": {
    ja: `${appPathList["docs-how-to-use"]}/`,
    en: `/en${appPathList["docs-how-to-use"]}/`,
  },
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
};

export function createI18nUrl(
  appPathName: AppPathName,
  language: Language
): Url {
  const baseUrl = appBaseUrl();
  return `${baseUrl}${i18nUrlList[appPathName][language]}` as Url;
}

export type AppUrl = (typeof appUrlList)[keyof typeof appUrlList];
