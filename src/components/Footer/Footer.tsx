import {
  createExternalTransmissionPolicyLinksFromLanguages,
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

  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <div className={styles.wrapper}>
      <div className={styles['upper-section']}>
        <div className={styles['link-container']}>
          <div className={styles['link-item']}>
            <Link
              href={terms.link}
              prefetch={false}
              className={styles['terms-link-text']}
            >
              <p data-gtm-click="footer-terms-link">{terms.text}</p>
            </Link>
          </div>
          <div className={styles['separator-text']}>/</div>
          <div className={styles['link-item']}>
            <Link
              href={privacy.link}
              prefetch={false}
              className={styles['privacy-link-text']}
            >
              <p data-gtm-click="footer-privacy-link">{privacy.text}</p>
            </Link>
          </div>
          <div className={styles['separator-text']}>/</div>
          <div className={styles['link-item']}>
            <Link
              href={externalTransmissionPolicy.link}
              prefetch={false}
              className={styles['external-transmission-policy-link-text']}
            >
              <p data-gtm-click="transmission-policy-link">
                {externalTransmissionPolicy.text}
              </p>
            </Link>
          </div>
        </div>
      </div>
      <div className={styles['lower-section']}>
        <div className={styles['lower-section-text']}>
          Copyright (c) nekochans
        </div>
      </div>
    </div>
  );
};
