import { NextRequest, NextResponse } from 'next/server';

const middleware = (req: NextRequest) => {
  const url = req.nextUrl.clone();

  if (process.env.IS_IN_MAINTENANCE === '1') {
    url.pathname = '/maintenance';

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
};

export default middleware;
