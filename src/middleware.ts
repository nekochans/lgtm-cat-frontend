import { httpStatusCode } from '@/constants';
import { isBanCountry, isInMaintenance } from '@/edge';
import {
  isLanguage,
  mightExtractLanguageFromAppPath,
  removeLanguageFromAppPath,
} from '@/features';
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

export const config = {
  matcher: [
    '/',
    '/en',
    '/ja',
    '/upload',
    '/en/upload',
    '/ja/upload',
    '/terms',
    '/en/terms',
    '/ja/terms',
    '/privacy',
    '/en/privacy',
    '/ja/privacy',
    '/maintenance',
    '/en/maintenance',
    '/ja/maintenance',
  ],
};

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const { nextUrl } = req;

  const isBanCountryResult = await isBanCountry(req);
  if (isBanCountryResult) {
    return NextResponse.json(
      { message: 'Not available from your region.' },
      { status: httpStatusCode.forbidden },
    );
  }

  const language = mightExtractLanguageFromAppPath(nextUrl.pathname);
  const isInMaintenanceMode = await isInMaintenance();
  if (isInMaintenanceMode) {
    nextUrl.pathname = '/maintenance';
    if (isLanguage(language) && language !== 'ja') {
      nextUrl.pathname = `${language}/maintenance`;
    }

    return NextResponse.rewrite(nextUrl);
  }

  if (language === 'ja') {
    const removedLanguagePath = removeLanguageFromAppPath(nextUrl.pathname);
    if (nextUrl.pathname !== '/ja') {
      return NextResponse.redirect(new URL(removedLanguagePath, req.url));
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
};
