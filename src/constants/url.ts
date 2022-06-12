export const appBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '';

export const urlList = {
  top: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/ogp.webp`,
  upload: `${appBaseUrl()}/upload`,
  terms: `${appBaseUrl()}/terms`,
  privacy: `${appBaseUrl()}/privacy`,
} as const;

export const apiList = {
  issueClientCredentialsAccessToken: '/api/oidc/token',
  fetchLgtmImages: '/api/lgtm/images',
  uploadCatImage: '/api/lgtm/images',
};

export const pathList = {
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

// この関数はサーバーサイドでしか動作しない
export const cognitoTokenEndpointUrl = (): string =>
  process.env.COGNITO_TOKEN_ENDPOINT ? process.env.COGNITO_TOKEN_ENDPOINT : '';

const lgtmeowApiUrl = (): string =>
  process.env.NEXT_PUBLIC_LGTMEOW_API_URL
    ? process.env.NEXT_PUBLIC_LGTMEOW_API_URL
    : '';

// この関数はサーバーサイドでしか動作しない
export const uploadCatImageUrl = (): string => `${lgtmeowApiUrl()}/lgtm-images`;

// この関数はサーバーサイドでしか動作しない
export const fetchLgtmImagesUrl = (): string =>
  `${lgtmeowApiUrl()}/lgtm-images`;

// この関数はサーバーサイドでしか動作しない
export const fetchLgtmImagesInRecentlyCreatedUrl = (): string =>
  `${lgtmeowApiUrl()}/lgtm-images/recently-created`;

export const imageRecognitionApiUrl = (): string =>
  process.env.NEXT_PUBLIC_IMAGE_RECOGNITION_API_URL
    ? process.env.NEXT_PUBLIC_IMAGE_RECOGNITION_API_URL
    : '';

export const isAcceptableCatImageUrl = (): string =>
  `${imageRecognitionApiUrl()}/cat-images/validation-results`;
