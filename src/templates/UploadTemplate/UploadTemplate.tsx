'use client';

import { ResponsiveLayout, UploadForm } from '@/components';
import { type Language, type Url } from '@/features';
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
  appBaseUrl: Url;
  children: ReactNode;
};

export const UploadTemplate: FC<Props> = ({
  language,
  appBaseUrl,
  children,
}) => {
  const { imageValidator } = useCatImageValidator(language, appBaseUrl);

  const { imageUploader } = useCatImageUploader(language, appBaseUrl);

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
          appUrl={appBaseUrl}
        />
        <div className={styles['image-wrapper']}>{children}</div>
      </ResponsiveLayout>
    </div>
  );
};
