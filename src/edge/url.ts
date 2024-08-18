import { appBaseUrl, isUrl, type Url } from '@/features/url';
import { headers } from 'next/headers';

export const appBaseUrlHeaderName = 'lgtmeow-app-base-url';

export const extractAppBaseUrlFromHeader = (): Url => {
  const url = headers().get(appBaseUrlHeaderName);
  if (isUrl(url)) {
    return url;
  }

  return appBaseUrl();
};
