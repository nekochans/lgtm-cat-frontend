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

export const apiList = {
  issueClientCredentialsAccessToken: '/api/oidc/token',
  fetchLgtmImages: '/api/lgtm/images',
  uploadCatImage: '/api/lgtm/images',
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

export const appUrlList = {
  top: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/ogp.webp` as const,
  upload: `${appBaseUrl()}${appPathList.upload}` as const,
  terms: `${appBaseUrl()}${appPathList.terms}` as const,
  privacy: `${appBaseUrl()}${appPathList.privacy}` as const,
  maintenance: `${appBaseUrl()}${appPathList.maintenance}` as const,
} as const;

export type AppUrl = typeof appUrlList[keyof typeof appUrlList];

const defaultUrl = 'http://localhost:2222/api';

// この関数はサーバーサイドでしか動作しない
export const cognitoTokenEndpointUrl = (): Url => {
  if (isUrl(process.env.COGNITO_TOKEN_ENDPOINT)) {
    return process.env.COGNITO_TOKEN_ENDPOINT;
  }

  return defaultUrl;
};

const lgtmeowApiUrl = (): Url => {
  if (isUrl(process.env.NEXT_PUBLIC_LGTMEOW_API_URL)) {
    return process.env.NEXT_PUBLIC_LGTMEOW_API_URL;
  }

  return defaultUrl;
};

export const uploadCatImageUrl = (): Url => `${lgtmeowApiUrl()}/lgtm-images`;

export const fetchLgtmImagesUrl = (): Url => `${lgtmeowApiUrl()}/lgtm-images`;

export const fetchLgtmImagesInRecentlyCreatedUrl = (): Url =>
  `${lgtmeowApiUrl()}/lgtm-images/recently-created`;

const imageRecognitionApiUrl = (): Url => {
  if (isUrl(process.env.NEXT_PUBLIC_IMAGE_RECOGNITION_API_URL)) {
    return process.env.NEXT_PUBLIC_IMAGE_RECOGNITION_API_URL;
  }

  return defaultUrl;
};

export const isAcceptableCatImageUrl = (): Url =>
  `${imageRecognitionApiUrl()}/cat-images/validation-results`;
