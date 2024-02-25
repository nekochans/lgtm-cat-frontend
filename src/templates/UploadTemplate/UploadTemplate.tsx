'use client';

import { ResponsiveLayout, UploadForm } from '@/components';
import {
  appBaseUrl,
  type Language,
} from '@/features';
import {
  useCatImageUploader,
  useCatImageValidator,
  useSwitchLanguage,
} from '@/hooks';
import {
  sendCopyMarkdownFromCopyButton,
  sendCopyMarkdownFromCreatedImage,
  sendUploadedCatImage,
} from '@/utils';
import Image from 'next/image';
import type { FC } from 'react';
import cat from './images/cat.webp';
import styles from './UploadTemplate.module.css';

const CatImage = () => (
  <Image src={cat.src} width={302} height={302} alt="Cat" priority={true} />
);

type Props = {
  language: Language;
};

export const UploadTemplate: FC<Props> = ({ language }) => {
  const { imageValidator } = useCatImageValidator(language);

  const { imageUploader } = useCatImageUploader(language);

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
    <div onClick={onClickOutSideMenu} aria-hidden="true">
      <ResponsiveLayout
        language={language}
        isLanguageMenuDisplayed={isLanguageMenuDisplayed}
        onClickLanguageButton={onClickLanguageButton}
        currentUrlPath="/upload"
      >
        <UploadForm
          language={language}
          imageValidator={imageValidator}
          imageUploader={imageUploader}
          uploadCallback={sendUploadedCatImage}
          onClickCreatedLgtmImage={sendCopyMarkdownFromCreatedImage}
          onClickMarkdownSourceCopyButton={sendCopyMarkdownFromCopyButton}
          appUrl={appBaseUrl()}
        />
        <div className={styles['image-wrapper']}>
          <CatImage/>
        </div>
      </ResponsiveLayout>
    </div>
  );
};
