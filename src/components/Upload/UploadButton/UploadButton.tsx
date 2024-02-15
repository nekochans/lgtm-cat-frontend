import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { FC, FormEventHandler } from 'react';
import styles from './UploadButton.module.css';

const createText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'アップロードする';
    case 'en':
      return 'Upload';
    default:
      return assertNever(language);
  }
};

type Props = {
  language: Language;
  disabled: boolean;
  onClick: FormEventHandler;
};

export const UploadButton: FC<Props> = ({ language, disabled, onClick }) => {
  if (!disabled) {
    return (
      <button
        type="submit"
        disabled={disabled}
        onClick={onClick}
        className={styles.button}
      >
        <div className={styles.text}>{createText(language)}</div>
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${styles['disabled-button']}`}
    >
      <div className={`${styles.text} ${styles['disabled-text']}`}>
        {createText(language)}
      </div>
    </button>
  );
};
