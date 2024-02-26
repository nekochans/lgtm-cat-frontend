'use client';

import {
  LibraryBooks,
  MarkdownContents,
  MarkdownPageTitle,
  ResponsiveLayout,
} from '@/components';
import {
  createPrivacyPolicyLinksFromLanguages,
  createTermsOfUseLinksFromLanguages,
  type Language,
} from '@/features';
import { useSwitchLanguage } from '@/hooks';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import styles from './TermsOrPrivacyTemplate.module.css';

export type TemplateType = 'terms' | 'privacy';

type Props = {
  type: TemplateType;
  language: Language;
  jaMarkdown: string;
  enMarkdown: string;
};

const createTitle = (type: TemplateType, language: Language): string => {
  switch (type) {
    case 'privacy':
      return createPrivacyPolicyLinksFromLanguages(language).text;
    case 'terms':
      return createTermsOfUseLinksFromLanguages(language).text;
    default:
      return assertNever(type);
  }
};

// eslint-disable-next-line max-lines-per-function
export const TermsOrPrivacyTemplate: FC<Props> = ({
  type,
  language,
  jaMarkdown,
  enMarkdown,
}) => {
  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  const termsMarkdown = language === 'ja' ? jaMarkdown : enMarkdown;

  const currentUrlPath =
    type === 'terms'
      ? createTermsOfUseLinksFromLanguages(language).link
      : createPrivacyPolicyLinksFromLanguages(language).link;

  return (
    <div onClick={onClickOutSideMenu} aria-hidden="true">
      <ResponsiveLayout
        language={language}
        isLanguageMenuDisplayed={isLanguageMenuDisplayed}
        onClickLanguageButton={onClickLanguageButton}
        currentUrlPath={currentUrlPath}
      >
        <div className={styles.wrapper}>
          <MarkdownPageTitle text={createTitle(type, language)} />
          <LibraryBooks />
          <div className={styles['children-wrapper']}>
            <MarkdownContents markdown={termsMarkdown} />
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
};
