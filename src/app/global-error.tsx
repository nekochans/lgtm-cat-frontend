'use client';

import { httpStatusCode } from '@/constants/httpStatusCode';
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect, type JSX } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalError = ({ error }: Props): JSX.Element => {
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
};

export default GlobalError;
