import { NextRequest, NextResponse } from 'next/server';

import {
  isBanCountry,
  isInMaintenance,
  mightExtractLocaleFromAcceptLanguage,
  mightExtractLocaleFromCookie,
  mightExtractLocaleFromGeo,
} from './edge';

export const config = {
  matcher: ['/', '/upload', '/terms', '/privacy', '/maintenance'],
};

// eslint-disable-next-line max-statements
const execInMaintenance = (req: NextRequest) => {
  const { nextUrl } = req;

  const localeExtractedFromCookie = mightExtractLocaleFromCookie(req);
  if (localeExtractedFromCookie === 'en') {
    nextUrl.pathname = `/${localeExtractedFromCookie}/maintenance`;

    return NextResponse.rewrite(nextUrl);
  }

  const localeExtractedFromGeo = mightExtractLocaleFromGeo(req);
  if (localeExtractedFromGeo === 'en') {
    nextUrl.pathname = `/${localeExtractedFromGeo}/maintenance`;

    return NextResponse.rewrite(nextUrl);
  }

  const localeExtractedFromAcceptLanguage =
    mightExtractLocaleFromAcceptLanguage(req);
  if (localeExtractedFromAcceptLanguage === 'en') {
    nextUrl.pathname = `/${localeExtractedFromAcceptLanguage}/maintenance`;

    return NextResponse.rewrite(nextUrl);
  }

  nextUrl.pathname = '/maintenance';

  return NextResponse.rewrite(nextUrl);
};

// eslint-disable-next-line max-statements
const exec = (req: NextRequest) => {
  const { nextUrl } = req;

  const localeExtractedFromCookie = mightExtractLocaleFromCookie(req);
  if (localeExtractedFromCookie === 'en') {
    nextUrl.pathname = `/${localeExtractedFromCookie}${nextUrl.pathname}`;

    return NextResponse.rewrite(nextUrl);
  }

  const localeExtractedFromGeo = mightExtractLocaleFromGeo(req);
  if (localeExtractedFromGeo === 'en') {
    nextUrl.pathname = `/${localeExtractedFromGeo}${nextUrl.pathname}`;

    return NextResponse.rewrite(nextUrl);
  }

  const localeExtractedFromAcceptLanguage =
    mightExtractLocaleFromAcceptLanguage(req);
  if (localeExtractedFromAcceptLanguage === 'en') {
    nextUrl.pathname = `/${localeExtractedFromAcceptLanguage}${nextUrl.pathname}`;

    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
};

export const middleware = (req: NextRequest) => {
  if (isBanCountry(req)) {
    const { nextUrl } = req;

    nextUrl.pathname = '/api/errors';

    return NextResponse.rewrite(nextUrl);
  }

  if (isInMaintenance()) {
    return execInMaintenance(req);
  }

  return exec(req);
};
