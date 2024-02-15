import type { Language } from '@/features';
import { assertNever } from '@/utils';
import { useEffect, useState, type FC } from 'react';
import styles from './UploadProgressBar.module.css';

const messageText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '送信中…';
    case 'en':
      return 'Uploading…';
    default:
      return assertNever(language);
  }
};

type Props = {
  language: Language;
};

export const UploadProgressBar: FC<Props> = ({ language }) => {
  const minWidth = 1;

  const maxWidth = 279;

  const incrementValue = 10;

  const interval = 200;

  const [progressLength, setProgressLength] = useState<number>(minWidth);

  useEffect(() => {
    const id = setInterval(() => {
      const updatedWidth =
        progressLength <= maxWidth ? progressLength + incrementValue : minWidth;

      setProgressLength(updatedWidth);
    }, interval);

    return () => {
      clearInterval(id);
    };
  }, [progressLength]);

  return (
    <div className={styles.wrapper}>
      <div className={styles['bar-wrapper']}>
        <div className={styles['default-color-bar']}>
          <div
            className={styles['main-color-bar']}
            style={{ width: `${progressLength}px` }}
          />
        </div>
      </div>
      <p className={styles.message}>{messageText(language)}</p>
    </div>
  );
};
