import {
  appBaseUrl,
  i18nUrlList,
  languages,
  metaTagList,
  type Language,
} from '@/features';
import { useCatImageUploader, useCatImageValidator } from '@/hooks';
import { DefaultLayout } from '@/layouts';
import {
  sendCopyMarkdownFromCopyButton,
  sendCopyMarkdownFromCreatedImage,
  sendUploadedCatImage,
} from '@/utils';
import { UploadTemplate as OrgUploadTemplate } from '@nekochans/lgtm-cat-ui';
import Image from 'next/image';
import type { FC } from 'react';
import cat from './images/cat.webp';

const CatImage = () => (
  <Image src={cat.src} width={302} height={302} alt="Cat" priority={true} />
);

type Props = {
  language: Language;
};

export const UploadTemplate: FC<Props> = ({ language }) => {
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
        uploadCallback={sendUploadedCatImage}
        onClickCreatedLgtmImage={sendCopyMarkdownFromCreatedImage}
        onClickMarkdownSourceCopyButton={sendCopyMarkdownFromCopyButton}
        appUrl={appBaseUrl()}
      />
    </DefaultLayout>
  );
};
