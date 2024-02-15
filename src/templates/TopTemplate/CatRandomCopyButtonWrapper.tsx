import {
  CatRandomCopyButton,
  type CatRandomCopyButtonProps,
} from '@/components';
import type { FC } from 'react';
import styles from './CatRandomCopyButtonWrapper.module.css';

type Props = CatRandomCopyButtonProps;

export const CatRandomCopyButtonWrapper: FC<Props> = ({
  appUrl,
  imageUrl,
  callback,
}) => (
  <div className={styles.wrapper}>
    <CatRandomCopyButton
      appUrl={appUrl}
      imageUrl={imageUrl}
      callback={callback}
    />
  </div>
);
