// 絶対厳守：編集前に必ずAI実装ルールを読む

import { appPathList, i18nUrlList } from "@/constants/url";
import { isUrl } from "@/functions/url";
import type { Language } from "@/types/language";
import type { AppPathName, Url } from "@/types/url";

const defaultAppUrl = "https://lgtmeow.com";

export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return defaultAppUrl;
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
  docsGitHubApp: `${appBaseUrl()}${appPathList["docs-github-app"]}` as const,
} as const;

export type AppUrl = (typeof appUrlList)[keyof typeof appUrlList];

export function createI18nUrl(
  appPathName: AppPathName,
  language: Language
): Url {
  const baseUrl = appBaseUrl();
  return `${baseUrl}${i18nUrlList[appPathName][language]}` as Url;
}
