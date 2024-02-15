import type { FC } from 'react';
import { CatFetchButton } from '../CatFetchButton';
import { UploadCatButton } from '../UploadCatButton';
import styles from './CatButtonGroup.module.css';

type Props = {
  onClickFetchRandomCatButton: () => Promise<void>;
  onClickFetchNewArrivalCatButton: () => Promise<void>;
};

export const CatButtonGroup: FC<Props> = ({
  onClickFetchRandomCatButton,
  onClickFetchNewArrivalCatButton,
}) => (
  <div className={styles.wrapper}>
    <div className={styles['button-group']}>
      <UploadCatButton
        link="/upload"
        customDataAttrGtmClick="top-upload-cat-button"
      />
      <CatFetchButton type="refresh" onClick={onClickFetchRandomCatButton} />
      <CatFetchButton type="new" onClick={onClickFetchNewArrivalCatButton} />
    </div>
  </div>
);
