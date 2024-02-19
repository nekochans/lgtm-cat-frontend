'use client';

import { httpStatusCode } from '@/constants';
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

  const language = 'en';

  const currentUrlPath = usePathname();

  return (
    <ErrorTemplate
      type={httpStatusCode.internalServerError}
      language={language}
      currentUrlPath={currentUrlPath}
    />
  );
};

export default Error;
