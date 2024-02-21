import { httpStatusCode } from '@/constants';
import { appPathList } from '@/features';
import { ErrorTemplate } from '@/templates';
import type { JSX } from 'react';

const NotFound = (): JSX.Element => {
  const language = 'ja';

  return (
    <ErrorTemplate
      type={httpStatusCode.notFound}
      language={language}
      currentUrlPath={appPathList.top}
    />
  );
};

export default NotFound;
