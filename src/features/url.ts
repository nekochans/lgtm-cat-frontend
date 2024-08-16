import { languages, type Language } from './language';

export type Url = `http://localhost${string}` | `https://${string}`;

export const isUrl = (value: unknown): value is Url => {
  if (typeof value !== 'string') {
    return false;
  }

  return (
    value.substring(0, 8) === 'https://' ||
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
  'external-transmission-policy': '/external-transmission-policy',
} as const;

export type AppPathName =
  | 'top'
  | 'upload'
  | 'terms'
  | 'privacy'
  | 'maintenance'
  | 'external-transmission-policy';

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
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

  if (value === '/') {
    return true;
  }

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
  externalTransmission:
    `${appBaseUrl()}${appPathList['external-transmission-policy']}` as const,
} as const;

type I18nUrlList = {
  [key in AppPathName]: {
    [childrenKey in Language]: string;
  };
};

export const i18nUrlList: I18nUrlList = {
  top: {
    ja: `${appPathList.top}/`,
    en: `/en/`,
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
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  'external-transmission-policy': {
    ja: `${appPathList['external-transmission-policy']}/`,
    en: `/en${appPathList['external-transmission-policy']}/`,
  },
};

export type AppUrl = (typeof appUrlList)[keyof typeof appUrlList];

export const uploadCatImageUrl = (baseUrl?: Url): Url =>
  `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images`;

export const fetchLgtmImagesUrl = (baseUrl?: Url): Url =>
  `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images`;

export const fetchLgtmImagesInRecentlyCreatedUrl = (baseUrl?: Url): Url =>
  `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images/recently-created`;

export const isAcceptableCatImageUrl = (baseUrl?: Url): Url =>
  `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/cat-images/validation-results`;

export const lgtmeowApiUrl = (): Url => {
  if (isUrl(process.env.LGTMEOW_API_URL)) {
    return process.env.LGTMEOW_API_URL;
  }

  throw new Error('LGTMEOW_API_URL is not defined');
};

export const imageRecognitionApiUrl = (): Url => {
  if (isUrl(process.env.IMAGE_RECOGNITION_API_URL)) {
    return process.env.IMAGE_RECOGNITION_API_URL;
  }

  throw new Error('IMAGE_RECOGNITION_API_URL is not defined');
};
