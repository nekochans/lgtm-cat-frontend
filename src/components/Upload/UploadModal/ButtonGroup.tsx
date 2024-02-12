import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import styles from './ButtonGroup.module.css';

const cancelButtonText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'キャンセル';
    case 'en':
      return 'cancel';
    default:
      return assertNever(language);
  }
};

const uploadButtonText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'アップロード';
    case 'en':
      return 'upload';
    default:
      return assertNever(language);
  }
};

type Props = {
  language: Language;
  onClickUpload: () => Promise<void>;
  onClickCancel: () => void;
};

export const ButtonGroup: FC<Props> = ({
  language,
  onClickUpload,
  onClickCancel,
}) => (
  <div className={styles.wrapper}>
    <button onClick={onClickCancel} className={styles['cancel-button']}>
      <div className={styles['cancel-button-text']}>
        {cancelButtonText(language)}
      </div>
    </button>
    <button onClick={onClickUpload} className={styles['upload-button']}>
      <div className={styles['upload-button-text']}>
        {uploadButtonText(language)}
      </div>
    </button>
  </div>
);
