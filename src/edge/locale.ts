import { NextRequest } from 'next/server';

import type { Locale } from '../features';

export const mightExtractLocaleFromCookie = (
  req: NextRequest,
): Locale | null => {
  const language = req.cookies.get('language');

  if (language && language !== 'ja') {
    return 'en';
  }

  return null;
};

export const mightExtractLocaleFromGeo = (req: NextRequest): Locale | null => {
  const country = req.geo?.country?.toLowerCase();

  if (country && country !== 'jp') {
    return 'en';
  }

  return null;
};

export const mightExtractLocaleFromAcceptLanguage = (
  req: NextRequest,
): Locale | null => {
  // eslint-disable-next-line no-magic-numbers
  const locale = req.headers.get('accept-language')?.split(',')?.[0];

  if (locale && locale !== 'ja') {
    return 'en';
  }

  return null;
};
