import { httpStatusCode } from '@/constants';
import { isBanCountry, isInMaintenance } from '@/edge';
import { isLanguage, mightExtractLanguageFromUrlPath } from '@/features';
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

export const config = {
  matcher: [
    '/',
    '/en',
    '/upload',
    '/en/upload',
    '/terms',
    '/en/terms',
    '/privacy',
    '/en/privacy',
    '/maintenance',
    '/en/maintenance',
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

  const language = mightExtractLanguageFromUrlPath(nextUrl.pathname);
  const isInMaintenanceMode = await isInMaintenance();
  if (isInMaintenanceMode) {
    nextUrl.pathname = '/maintenance';
    if (isLanguage(language) && language !== 'ja') {
      nextUrl.pathname = `${language}/maintenance`;
    }

    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
};
