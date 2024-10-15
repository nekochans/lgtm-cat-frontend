'use client';

import { httpStatusCode } from '@/constants/httpStatusCode';
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { type JSX, useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

function GlobalError({ error }: Props): JSX.Element {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <NextError statusCode={httpStatusCode.internalServerError} />
      </body>
    </html>
  );
}

export default GlobalError;
