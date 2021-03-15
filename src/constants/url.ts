const appBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '';

// eslint-disable-next-line import/prefer-default-export
export const urlList = {
  top: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/ogp.webp`,
  terms: `${appBaseUrl()}/terms`,
  privacy: `${appBaseUrl()}/privacy`,
  error: `${appBaseUrl()}/error`,
} as const;

export const pathList = {
  top: '/',
  terms: '/terms',
  privacy: '/privacy',
  error: '/error',
} as const;

export type AppPathName = 'top' | 'terms' | 'privacy' | 'error';
