'use client';

import { httpStatusCode } from '@/constants';
import { isIncludeLanguageAppPath } from '@/features';
import { ErrorTemplate } from '@/templates';
import { usePathname } from 'next/navigation';
import { useEffect, type JSX } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error }: Props): JSX.Element => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const language = 'ja';

  const currentUrlPath = usePathname();

  const appPath = isIncludeLanguageAppPath(currentUrlPath)
    ? currentUrlPath
    : '/';

  return (
    <ErrorTemplate
      type={httpStatusCode.internalServerError}
      language={language}
      currentUrlPath={appPath}
    />
  );
};

export default Error;
