const appBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '';

export const urlList = {
  top: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/ogp.webp`,
  terms: `${appBaseUrl()}/terms`,
  privacy: `${appBaseUrl()}/privacy`,
  error: `${appBaseUrl()}/error`,
} as const;

export const apiList = { fetchLgtmImages: '/api/lgtm/images' };

export const pathList = {
  top: '/',
  terms: '/terms',
  privacy: '/privacy',
  error: '/error',
} as const;

export type AppPathName = 'top' | 'terms' | 'privacy' | 'error';
