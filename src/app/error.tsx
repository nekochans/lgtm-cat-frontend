'use client';

import { Footer } from '@/components';
import { httpStatusCode } from '@/constants';
import { isIncludeLanguageAppPath } from '@/features';
import { ErrorTemplate } from '@/templates';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, type JSX } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error }: Props): JSX.Element => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const language = 'ja';

  const currentUrlPath = usePathname();

  const appPath = isIncludeLanguageAppPath(currentUrlPath)
    ? currentUrlPath
    : '/';

  return (
    <>
      <ErrorTemplate
        type={httpStatusCode.internalServerError}
        language={language}
        currentUrlPath={appPath}
      />
      <Footer language={language} />
    </>
  );
};

export default Error;
