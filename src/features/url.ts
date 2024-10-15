import { type Language, languages } from './language';

export type Url = `http://localhost${string}` | `https://${string}`;

export function isUrl(value: unknown): value is Url {
  if (typeof value !== 'string') {
    return false;
  }

  return (
    value.substring(0, 8) === 'https://'
    || value.substring(0, 16) === 'http://localhost'
  );
}

export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return 'https://lgtmeow.com';
}

export const appPathList = {
  'home': '/',
  'upload': '/upload',
  'terms': '/terms',
  'privacy': '/privacy',
  'error': '/error',
  'maintenance': '/maintenance',
  'external-transmission-policy': '/external-transmission-policy',
  'login': '/login',
} as const;

export type AppPathName =
  | 'home'
  | 'upload'
  | 'terms'
  | 'privacy'
  | 'maintenance'
  | 'external-transmission-policy'
  | 'login';

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | '/';

export function isIncludeLanguageAppPath(value: unknown): value is IncludeLanguageAppPath {
  const appPaths: string[] = Object.values(appPathList);

  if (typeof value !== 'string') {
    return false;
  }

  if (value === '/') {
    return true;
  }

  if (languages.some(language => value === `/${language}`)) {
    return true;
  }

  if (
    languages.some(language =>
      appPaths.some(path => value === `/${language}${path}`),
    )
  ) {
    return true;
  }

  if (appPaths.includes(value)) {
    return true;
  }

  return false;
}

export function createIncludeLanguageAppPath(appPathName: AppPathName, language: Language): IncludeLanguageAppPath {
  if (appPathName === 'home' && language === 'en') {
    return `/${language}`;
  }

  return language === 'en'
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
    `${appBaseUrl()}${appPathList['external-transmission-policy']}` as const,
  login: `${appBaseUrl()}${appPathList.login}` as const,
} as const;

type I18nUrlList = {
  [key in AppPathName]: {
    [childrenKey in Language]: string;
  };
};

export const i18nUrlList: I18nUrlList = {
  'home': {
    ja: `${appPathList.home}/`,
    en: `/en/`,
  },
  'upload': {
    ja: `${appPathList.upload}/`,
    en: `/en${appPathList.upload}/`,
  },
  'terms': {
    ja: `${appPathList.terms}/`,
    en: `/en${appPathList.terms}/`,
  },
  'privacy': {
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  'maintenance': {
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  'external-transmission-policy': {
    ja: `${appPathList['external-transmission-policy']}/`,
    en: `/en${appPathList['external-transmission-policy']}/`,
  },
  'login': {
    ja: `${appPathList.login}/`,
    en: `/en${appPathList.login}/`,
  },
};

export type AppUrl = (typeof appUrlList)[keyof typeof appUrlList];

export function uploadCatImageUrl(baseUrl?: Url): Url {
  return `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images`;
}

export function fetchLgtmImagesUrl(baseUrl?: Url): Url {
  return `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images`;
}

export function fetchLgtmImagesInRecentlyCreatedUrl(baseUrl?: Url): Url {
  return `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/lgtm-images/recently-created`;
}

export function isAcceptableCatImageUrl(baseUrl?: Url): Url {
  return `${isUrl(baseUrl) ? baseUrl : appBaseUrl()}/api/cat-images/validation-results`;
}

export function lgtmeowApiUrl(): Url {
  if (isUrl(process.env.LGTMEOW_API_URL)) {
    return process.env.LGTMEOW_API_URL;
  }

  throw new Error('LGTMEOW_API_URL is not defined');
}

export function imageRecognitionApiUrl(): Url {
  if (isUrl(process.env.IMAGE_RECOGNITION_API_URL)) {
    return process.env.IMAGE_RECOGNITION_API_URL;
  }

  throw new Error('IMAGE_RECOGNITION_API_URL is not defined');
}
