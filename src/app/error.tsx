'use client';

import {
  ErrorContent,
  InternalServerErrorImage,
  ResponsiveLayout,
} from '@/components';
import { customErrorTitle, errorMetaTag } from '@/features';
import { useSwitchLanguage } from '@/hooks';
import { ErrorLayout } from '@/layouts';
import { usePathname } from 'next/navigation';
import { useEffect, type JSX } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error, reset }: Props): JSX.Element => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const language = 'ja';

  const metaTag = errorMetaTag(language);

  const currentUrlPath = usePathname();

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
    <ErrorLayout title={customErrorTitle(language)} metaTag={metaTag}>
      <div onClick={onClickOutSideMenu} aria-hidden="true">
        <ResponsiveLayout
          language={language}
          isLanguageMenuDisplayed={isLanguageMenuDisplayed}
          onClickLanguageButton={onClickLanguageButton}
          currentUrlPath={currentUrlPath}
        >
          <ErrorContent
            type={500}
            language={language}
            catImage={<InternalServerErrorImage />}
            shouldDisplayBackToTopButton={false}
            onClickRetryButton={reset}
          />
        </ResponsiveLayout>
      </div>
    </ErrorLayout>
  );
};

export default Error;
