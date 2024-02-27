import { UploadCatButton } from '@/components';
import { createIncludeLanguageAppPath, type Language } from '@/features';
import type { FC } from 'react';
import { CatFetchButton } from '../CatFetchButton';
import styles from './CatButtonGroup.module.css';

type Props = {
  language: Language;
  onClickFetchRandomCatButton: () => Promise<void>;
  onClickFetchNewArrivalCatButton: () => Promise<void>;
};

export const CatButtonGroup: FC<Props> = ({
  language,
  onClickFetchRandomCatButton,
  onClickFetchNewArrivalCatButton,
}) => (
  <div className={styles.wrapper}>
    <div className={styles['button-group']}>
      <UploadCatButton
        link={createIncludeLanguageAppPath('upload', language)}
        customDataAttrGtmClick="top-upload-cat-button"
      />
      <CatFetchButton type="refresh" onClick={onClickFetchRandomCatButton} />
      <CatFetchButton type="new" onClick={onClickFetchNewArrivalCatButton} />
    </div>
  </div>
);
