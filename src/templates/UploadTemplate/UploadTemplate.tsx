import { ResponsiveLayout, UploadForm } from '@/components';
import {
  appBaseUrl,
  i18nUrlList,
  languages,
  metaTagList,
  type Language,
} from '@/features';
import {
  useCatImageUploader,
  useCatImageValidator,
  useSwitchLanguage,
} from '@/hooks';
import { DefaultLayout } from '@/layouts';
import {
  type sendCopyMarkdownFromCopyButton,
  type sendCopyMarkdownFromCreatedImage,
  type sendUploadedCatImage,
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
  callbackFunctions?: {
    uploadCallback?: typeof sendUploadedCatImage;
    onClickCreatedLgtmImage?: typeof sendCopyMarkdownFromCreatedImage;
    onClickMarkdownSourceCopyButton?: typeof sendCopyMarkdownFromCopyButton;
  };
};

export const UploadTemplate: FC<Props> = ({ language, callbackFunctions }) => {
  const metaTag = metaTagList(language).upload;

  const canonicalLink =
    language === 'en' ? i18nUrlList.upload?.en : i18nUrlList.upload?.ja;

  const alternateUrls = languages.map((hreflang) => {
    const link =
      hreflang === 'en' ? i18nUrlList.upload?.en : i18nUrlList.upload?.ja;

    return { link, hreflang };
  });

  const { imageValidator } = useCatImageValidator(language);

  const { imageUploader } = useCatImageUploader(language);

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
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
            uploadCallback={callbackFunctions?.uploadCallback}
            onClickCreatedLgtmImage={callbackFunctions?.onClickCreatedLgtmImage}
            onClickMarkdownSourceCopyButton={
              callbackFunctions?.onClickMarkdownSourceCopyButton
            }
            appUrl={appBaseUrl()}
          />
          <div className={styles['image-wrapper']}>
            <CatImage />
          </div>
        </ResponsiveLayout>
      </div>
    </DefaultLayout>
  );
};
