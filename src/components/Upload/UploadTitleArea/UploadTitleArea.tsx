import { type Language } from '@/features';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import styles from './UploadTitleArea.module.css';

type Props = {
  language: Language;
};

type Text =
  | '猫ちゃん画像をアップロードしてLGTM画像を作れます🐱'
  | 'You can upload cat images to create LGTM images🐱';

const text = (language: Language): Text => {
  switch (language) {
    case 'ja':
      return '猫ちゃん画像をアップロードしてLGTM画像を作れます🐱';
    case 'en':
      return 'You can upload cat images to create LGTM images🐱';
    default:
      return assertNever(language);
  }
};

export const UploadTitleArea: FC<Props> = ({ language }) => (
  <div className={styles.wrapper}>{text(language)}</div>
);
