import { languages, type Language } from './language';

export type Url = `http://localhost${string}` | `https://${string}`;

export const isUrl = (value: unknown): value is Url => {
  if (typeof value !== 'string') {
    return false;
  }

  return (
    // eslint-disable-next-line no-magic-numbers
    value.substring(0, 8) === 'https://' ||
    // eslint-disable-next-line no-magic-numbers
    value.substring(0, 16) === 'http://localhost'
  );
};

export const appBaseUrl = (): Url => {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return 'https://lgtmeow.com';
};

export const appPathList = {
  top: '/',
  upload: '/upload',
  terms: '/terms',
  privacy: '/privacy',
  error: '/error',
  maintenance: '/maintenance',
} as const;

export type AppPathName =
  | 'top'
  | 'upload'
  | 'terms'
  | 'privacy'
  | 'maintenance';

type AppPath = (typeof appPathList)[keyof typeof appPathList];

type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | '/';

export const isIncludeLanguageAppPath = (
  value: unknown,
): value is IncludeLanguageAppPath => {
  const appPaths: string[] = Object.values(appPathList);

  if (typeof value !== 'string') {
    return false;
  }

  // ルートパスの場合
  if (value === '/') {
    return true;
  }

  // Language 単体のパスの場合
  if (languages.some((language) => value === `/${language}`)) {
    return true;
  }

  if (
    languages.some((language) =>
      appPaths.some((path) => value === `/${language}${path}`),
    )
  ) {
    return true;
  }

  if (appPaths.includes(value)) {
    return true;
  }

  return false;
};

export const createIncludeLanguageAppPath = (
  appPathName: AppPathName,
  language: Language,
): IncludeLanguageAppPath => {
  if (appPathName === 'top' && language === 'en') {
    return `/${language}`;
  }

  return language === 'en'
    ? (`/en${appPathList[appPathName]}` as const)
    : appPathList[appPathName];
};

export const appUrlList = {
  top: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/ogp.webp` as const,
  upload: `${appBaseUrl()}${appPathList.upload}` as const,
  terms: `${appBaseUrl()}${appPathList.terms}` as const,
  privacy: `${appBaseUrl()}${appPathList.privacy}` as const,
  maintenance: `${appBaseUrl()}${appPathList.maintenance}` as const,
} as const;

type I18nUrlList = {
  [key in AppPathName]?: {
    [childrenKey in Language]: Url;
  };
};

export const i18nUrlList: I18nUrlList = {
  top: {
    ja: `${appUrlList.top}/`,
    en: `${appBaseUrl()}/en/`,
  },
  upload: {
    ja: `${appUrlList.upload}/`,
    en: `${appBaseUrl()}/en${appPathList.upload}/`,
  },
  terms: {
    ja: `${appUrlList.terms}/`,
    en: `${appBaseUrl()}/en${appPathList.terms}/`,
  },
  privacy: {
    ja: `${appUrlList.privacy}/`,
    en: `${appBaseUrl()}/en${appPathList.privacy}/`,
  },
};

export type AppUrl = (typeof appUrlList)[keyof typeof appUrlList];

const bffUrl = (): Url => {
  if (isUrl(process.env.NEXT_PUBLIC_LGTMEOW_BFF_URL)) {
    return process.env.NEXT_PUBLIC_LGTMEOW_BFF_URL;
  }

  return 'http://localhost:8787';
};

export const uploadCatImageUrl = (): Url => `${bffUrl()}/lgtm-images`;

export const fetchLgtmImagesUrl = (): Url => `${bffUrl()}/lgtm-images`;

export const fetchLgtmImagesInRecentlyCreatedUrl = (): Url =>
  `${bffUrl()}/lgtm-images/recently-created`;

export const isAcceptableCatImageUrl = (): Url =>
  `${bffUrl()}/cat-images/validation-results`;
