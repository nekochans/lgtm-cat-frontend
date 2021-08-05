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
  issueAccessToken: '/api/idp/tokens',
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
