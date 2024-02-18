import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { ComponentPropsWithoutRef, FC } from 'react';
import styles from './RetryButton.module.css';

const retryButtonText = {
  ja: 'もう一度試す',
  en: 'Try again',
} as const;

type RetryButtonText = (typeof retryButtonText)[keyof typeof retryButtonText];

const createRetryButtonText = (language: Language): RetryButtonText => {
  switch (language) {
    case 'ja':
      return retryButtonText.ja;
    case 'en':
      return retryButtonText.en;
    default:
      return assertNever(language);
  }
};

type Props = ComponentPropsWithoutRef<'button'> & {
  language: Language;
};

export const RetryButton: FC<Props> = ({ language, onClick }) => (
  <button className={styles.button} onClick={onClick}>
    <span className={styles.text}>{createRetryButtonText(language)}</span>
  </button>
);
