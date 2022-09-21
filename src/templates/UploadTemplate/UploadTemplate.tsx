import { UploadTemplate as OrgUploadTemplate } from '@nekochans/lgtm-cat-ui';
import Image from 'next/image';

import {
  metaTagList,
  appBaseUrl,
  appUrlList,
  languages,
  type Language,
} from '../../features';
import {
  useSaveSettingLanguage,
  useCatImageValidator,
  useCatImageUploader,
} from '../../hooks';
import { DefaultLayout } from '../../layouts';
import {
  sendUploadedCatImage,
  sendCopyMarkdownFromCreatedImage,
  sendCopyMarkdownFromCopyButton,
} from '../../utils';

import cat from './images/cat.webp';

import type { FC } from 'react';

const CatImage = () => (
  <Image src={cat.src} width="302px" height="302px" alt="Cat" priority={true} />
);

const canonicalLink = `${appUrlList.upload}/` as const;

const alternateUrls = languages.map((hreflang) => {
  const link =
    hreflang === 'ja'
      ? canonicalLink
      : (`${canonicalLink}${hreflang}/` as const);

  return { link, hreflang };
});

type Props = {
  language: Language;
};

export const UploadTemplate: FC<Props> = ({ language }) => {
  const metaTag = metaTagList(language).upload;

  const { saveSettingLanguage } = useSaveSettingLanguage();

  const { imageValidator } = useCatImageValidator(language);

  const { imageUploader } = useCatImageUploader(language);

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
      <OrgUploadTemplate
        language={language}
        imageValidator={imageValidator}
        imageUploader={imageUploader}
        catImage={<CatImage />}
        changeLanguageCallback={saveSettingLanguage}
        uploadCallback={sendUploadedCatImage}
        onClickCreatedLgtmImage={sendCopyMarkdownFromCreatedImage}
        onClickMarkdownSourceCopyButton={sendCopyMarkdownFromCopyButton}
        appUrl={appBaseUrl()}
      />
    </DefaultLayout>
  );
};
