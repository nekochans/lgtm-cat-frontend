import {
  createPrivacyPolicyLinksFromLanguages,
  createTermsOfUseLinksFromLanguages,
  type Language,
} from '@/features';
import Link from 'next/link';
import type { FC } from 'react';
import styles from './Footer.module.css';

export type Props = {
  language: Language;
};

export const Footer: FC<Props> = ({ language }) => {
  const terms = createTermsOfUseLinksFromLanguages(language);

  const privacy = createPrivacyPolicyLinksFromLanguages(language);

  return (
    <div className={styles.wrapper}>
      <div className={styles['upper-section']}>
        <Link
          href={terms.link}
          prefetch={false}
          className={styles['terms-link-text']}
        >
          <p
            className={styles['terms-link-text']}
            data-gtm-click="footer-terms-link"
          >
            {terms.text}
          </p>
        </Link>
        <div className={styles['separator-text']}> / </div>
        <Link
          href={privacy.link}
          prefetch={false}
          className={styles['privacy-link-text']}
        >
          <p
            className={styles['privacy-link-text']}
            data-gtm-click="footer-privacy-link"
          >
            {privacy.text}
          </p>
        </Link>
      </div>
      <div className={styles['lower-section']}>
        <div className={styles['lower-section-text']}>
          Copyright (c) nekochans
        </div>
      </div>
    </div>
  );
};
