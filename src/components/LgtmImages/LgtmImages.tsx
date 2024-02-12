import type { AppUrl } from '@/constants';
import type { LgtmImage } from '@/features';
import type { FC } from 'react';
import { LgtmImageContent } from './LgtmImageContent';
import styles from './LgtmImages.module.css';

type Props = {
  images: LgtmImage[];
  appUrl?: AppUrl;
  callback?: () => void;
};

export const LgtmImages: FC<Props> = ({ images, appUrl, callback }) => (
  <div className={styles.wrapper}>
    {images.map((image) => (
      <LgtmImageContent
        id={image.id}
        imageUrl={image.imageUrl}
        key={image.id}
        appUrl={appUrl}
        callback={callback}
      />
    ))}
  </div>
);
