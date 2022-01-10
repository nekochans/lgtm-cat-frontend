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
  fetchLgtmImages: '/api/lgtm/images',
  uploadCatImage: '/api/lgtm/images',
};

export const pathList = {
  top: '/',
  upload: '/upload',
  terms: '/terms',
  privacy: '/privacy',
  error: '/error',
} as const;

export type AppPathName = 'top' | 'upload' | 'terms' | 'privacy';

// この関数はサーバーサイドでしか動作しない
export const cognitoTokenEndpointUrl = (): string =>
  process.env.COGNITO_TOKEN_ENDPOINT ? process.env.COGNITO_TOKEN_ENDPOINT : '';

const lgtmeowApiUrl = (): string =>
  process.env.LGTMEOW_API_URL ? process.env.LGTMEOW_API_URL : '';

// この関数はサーバーサイドでしか動作しない
export const uploadCatImageUrl = (): string => `${lgtmeowApiUrl()}/lgtm-images`;

// この関数はサーバーサイドでしか動作しない
export const fetchLgtmImagesUrl = (): string =>
  `${lgtmeowApiUrl()}/lgtm-images`;
