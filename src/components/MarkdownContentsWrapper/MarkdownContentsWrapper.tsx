import {
  LibraryBooks,
  MarkdownContents,
  MarkdownPageTitle,
} from '@/components';
import {
  createPrivacyPolicyLinksFromLanguages,
  createTermsOfUseLinksFromLanguages,
  type Language,
} from '@/features';
import { assertNever } from '@/utils';
import { type JSX } from 'react';
import styles from './MarkdownContentsWrapper.module.css';

type MarkdownContentsType = 'privacy' | 'terms';

const createTitle = (
  type: MarkdownContentsType,
  language: Language,
): string => {
  switch (type) {
    case 'privacy':
      return createPrivacyPolicyLinksFromLanguages(language).text;
    case 'terms':
      return createTermsOfUseLinksFromLanguages(language).text;
    default:
      return assertNever(type);
  }
};

type Props = {
  type: MarkdownContentsType;
  language: Language;
  markdown: string;
};

export const MarkdownContentsWrapper = ({
  type,
  language,
  markdown,
}: Props): JSX.Element => {
  return (
    <div className={styles.wrapper}>
      <MarkdownPageTitle text={createTitle(type, language)} />
      <LibraryBooks />
      <div className={styles['children-wrapper']}>
        <MarkdownContents markdown={markdown} />
      </div>
    </div>
  );
};
