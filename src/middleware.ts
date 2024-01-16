import { isBanCountry, isInMaintenance } from '@/edge';
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

export const config = {
  matcher: ['/', '/upload', '/terms', '/privacy', '/maintenance'],
};

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const { nextUrl } = req;

  if (isBanCountry(req)) {
    nextUrl.pathname = '/api/errors';

    return NextResponse.rewrite(nextUrl);
  }

  const isInMaintenanceMode = await isInMaintenance();
  if (isInMaintenanceMode) {
    nextUrl.pathname = '/maintenance';

    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
};
