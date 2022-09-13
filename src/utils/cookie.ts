import { setCookie as nookiesSetCookie } from 'nookies';

export const setCookie = (key: string, value: string, maxAge: number) => {
  nookiesSetCookie(null, key, value, {
    maxAge,
    path: '/',
  });
};
