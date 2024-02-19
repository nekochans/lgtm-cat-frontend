import { languages, type Language } from '@/features';
import Link from 'next/link';
import type { FC } from 'react';
import { FaAngleRight } from 'react-icons/fa';
import styles from './LanguageMenu.module.css';

export type Props = {
  language: Language;
  currentUrlPath: string;
};

const removeLanguageFromPath = (path: string): string => {
  const languageRegex = new RegExp(`/(?:${languages.join('|')})(/|$)`, 'g');

  return path.replace(languageRegex, '$1');
};

export const LanguageMenu: FC<Props> = ({ language, currentUrlPath }) => {
  const removedLanguagePath = removeLanguageFromPath(currentUrlPath);

  return (
    <nav className={styles.wrapper}>
      <span
        className={`${styles['text-wrapper']} ${styles['en-text-wrapper']}`}
      >
        <Link href={`/en${removedLanguagePath}`} className={styles.link}>
          <span
            className={styles['link-text']}
            data-gtm-click="language-menu-en-link"
          >
            {language === 'en' ? <FaAngleRight /> : ''}
            English
          </span>
        </Link>
      </span>
      <span className={styles.separator} />
      <span
        className={`${styles['text-wrapper']} ${styles['ja-text-wrapper']}`}
      >
        <Link
          href={removedLanguagePath}
          prefetch={false}
          className={styles.link}
        >
          <span
            className={styles['link-text']}
            data-gtm-click="language-menu-ja-link"
          >
            {language === 'ja' ? <FaAngleRight /> : ''}
            日本語
          </span>
        </Link>
      </span>
    </nav>
  );
};
