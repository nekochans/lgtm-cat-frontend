'use client';

import { ResponsiveLayout, UploadForm } from '@/components';
import { appBaseUrl, type Language } from '@/features';
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
import type { FC, ReactNode } from 'react';
import styles from './UploadTemplate.module.css';

type Props = {
  language: Language;
  children: ReactNode;
};

export const UploadTemplate: FC<Props> = ({ language, children }) => {
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
        <div className={styles['image-wrapper']}>{children}</div>
      </ResponsiveLayout>
    </div>
  );
};
