import {
  createPrivacyPolicyLinksFromLanguages,
  createTermsOfUseLinksFromLanguages,
  type Language,
} from '@/features';
import Link from 'next/link';
import type { FC } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import styles from './GlobalMenu.module.css';

export type Props = {
  language: Language;
  onClickCloseButton: () => void;
};

export const GlobalMenu: FC<Props> = ({ language, onClickCloseButton }) => {
  const termsOfUseLinks = createTermsOfUseLinksFromLanguages(language);
  const privacyPolicyLinks = createPrivacyPolicyLinksFromLanguages(language);

  return (
    <div className={styles.wrapper}>
      <div className={styles['header-wrapper']}>
        <button
          className={styles['fa-times-wrapper']}
          onClick={onClickCloseButton}
        >
          <FaTimes className={styles['fa-times']} />
        </button>
      </div>
      <div className={styles['link-group-wrapper']}>
        <div className={styles['link-wrapper']}>
          <Link href="/" prefetch={false}>
            <span
              className={styles['link-text']}
              data-gtm-click="global-menu-top-link"
            >
              TOP
            </span>
          </Link>
          <div className={styles.underline} />
        </div>
        <div className={styles['link-wrapper']}>
          <Link href="/upload" prefetch={false}>
            <span
              className={styles['link-text']}
              data-gtm-click="global-menu-upload-cat-link"
            >
              <FaCloudUploadAlt className={styles['fa-cloud-upload-alt']} />
              Upload new Cats
            </span>
          </Link>
          <div className={styles.underline} />
        </div>
        <div className={styles['link-wrapper']}>
          <Link href={termsOfUseLinks.link} prefetch={false}>
            <span
              className={styles['link-text']}
              data-gtm-click="global-menu-terms-link"
            >
              {termsOfUseLinks.text}
            </span>
          </Link>
          <div className={styles.underline} />
        </div>
        <div className={styles['link-wrapper']}>
          <Link href={privacyPolicyLinks.link} prefetch={false}>
            <span
              className={styles['link-text']}
              data-gtm-click="global-menu-terms-link"
            >
              {privacyPolicyLinks.text}
            </span>
          </Link>
          <div className={styles.underline} />
        </div>
      </div>
    </div>
  );
};
