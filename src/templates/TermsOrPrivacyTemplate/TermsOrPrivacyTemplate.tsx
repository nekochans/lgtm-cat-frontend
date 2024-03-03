'use client';

import { ResponsiveLayout } from '@/components';
import { type IncludeLanguageAppPath, type Language } from '@/features';
import { useSwitchLanguage } from '@/hooks';
import type { FC, ReactNode } from 'react';

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
  children: ReactNode;
};

// eslint-disable-next-line max-lines-per-function
export const TermsOrPrivacyTemplate: FC<Props> = ({
  language,
  currentUrlPath,
  children,
}) => {
  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
    <div onClick={onClickOutSideMenu} aria-hidden="true">
      <ResponsiveLayout
        language={language}
        isLanguageMenuDisplayed={isLanguageMenuDisplayed}
        onClickLanguageButton={onClickLanguageButton}
        currentUrlPath={currentUrlPath}
      >
        {children}
      </ResponsiveLayout>
    </div>
  );
};
