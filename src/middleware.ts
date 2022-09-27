import { NextRequest, NextResponse } from 'next/server';

import { isBanCountry, isInMaintenance } from './edge';

export const config = {
  matcher: ['/', '/upload', '/terms', '/privacy', '/maintenance'],
};

export const middleware = (req: NextRequest) => {
  const { nextUrl } = req;

  if (isBanCountry(req)) {
    nextUrl.pathname = '/api/errors';

    return NextResponse.rewrite(nextUrl);
  }

  if (isInMaintenance()) {
    nextUrl.pathname = '/maintenance';

    return NextResponse.rewrite(nextUrl);
  }

  return NextResponse.next();
};
