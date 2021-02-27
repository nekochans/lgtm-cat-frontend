const appBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '';

// eslint-disable-next-line import/prefer-default-export
export const urlList = {
  top: appBaseUrl(),
} as const;

export const pathList = {
  top: '/',
  terms: '/terms',
  privacy: '/privacy',
} as const;
