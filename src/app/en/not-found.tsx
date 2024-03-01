import { Footer } from '@/components';
import { httpStatusCode } from '@/constants';
import { appPathList, notFoundMetaTag } from '@/features';
import { ErrorTemplate } from '@/templates';
import type { Metadata } from 'next';
import type { JSX } from 'react';

const language = 'en';

export const metadata: Metadata = {
  title: notFoundMetaTag(language).title,
  description: notFoundMetaTag(language).description,
};

const NotFound = (): JSX.Element => {
  return (
    <>
      <ErrorTemplate
        type={httpStatusCode.notFound}
        language={language}
        currentUrlPath={appPathList.top}
      />
      <Footer language={language} />
    </>
  );
};

export default NotFound;
