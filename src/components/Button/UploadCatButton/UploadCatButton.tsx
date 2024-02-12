import type { CustomDataAttrGtmClick } from '@/utils';
import Link from 'next/link';
import type { FC } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import styles from './UploadCatButton.module.css';

type Props = {
  link: `/${string}`;
  customDataAttrGtmClick?: CustomDataAttrGtmClick;
};

export const UploadCatButton: FC<Props> = ({
  link,
  customDataAttrGtmClick,
}) => (
  <Link href={link} prefetch={false} className={styles.link}>
    <div
      className={`button-base ${styles.button}`}
      data-gtm-click={customDataAttrGtmClick}
    >
      <FaCloudUploadAlt
        className={`fa-cloud-upload-alt ${styles['fa-cloud-upload-alt']}`}
        data-gtm-click={customDataAttrGtmClick}
      />
      <div className="button-text" data-gtm-click={customDataAttrGtmClick}>
        Upload new Cats
      </div>
    </div>
  </Link>
);
