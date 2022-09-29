import type { FC } from 'react';
import { UploadTemplate as OrgUploadTemplate } from '@nekochans/lgtm-cat-ui';
import Image from 'next/image';

import {
  metaTagList,
  appBaseUrl,
  languages,
  i18nUrlList,
  type Language,
} from '../../features';
import { useCatImageValidator, useCatImageUploader } from '../../hooks';
import { DefaultLayout } from '../../layouts';
import {
  sendUploadedCatImage,
  sendCopyMarkdownFromCreatedImage,
  sendCopyMarkdownFromCopyButton,
} from '../../utils';

import cat from './images/cat.webp';

const CatImage = () => (
  <Image src={cat.src} width="302px" height="302px" alt="Cat" priority={true} />
);

const canonicalLink = i18nUrlList.upload?.ja;

const alternateUrls = languages.map((hreflang) => {
  const link = hreflang === 'ja' ? canonicalLink : i18nUrlList.upload?.en;

  return { link, hreflang };
});

type Props = {
  language: Language;
};

export const UploadTemplate: FC<Props> = ({ language }) => {
  const metaTag = metaTagList(language).upload;

  const { imageValidator } = useCatImageValidator(language);

  const { imageUploader } = useCatImageUploader(language);

  return (
    <DefaultLayout metaTag={metaTag} alternateUrls={alternateUrls}>
      <OrgUploadTemplate
        language={language}
        imageValidator={imageValidator}
        imageUploader={imageUploader}
        catImage={<CatImage />}
        uploadCallback={sendUploadedCatImage}
        onClickCreatedLgtmImage={sendCopyMarkdownFromCreatedImage}
        onClickMarkdownSourceCopyButton={sendCopyMarkdownFromCopyButton}
        appUrl={appBaseUrl()}
      />
    </DefaultLayout>
  );
};
