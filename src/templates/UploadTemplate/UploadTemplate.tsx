import { UploadTemplate as OrgUploadTemplate } from '@nekochans/lgtm-cat-ui';
import Image from 'next/image';

import { metaTagList, appBaseUrl, type Language } from '../../features';
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

type Props = {
  language: Language;
};

export const UploadTemplate: FC<Props> = ({ language }) => {
  const metaTag = metaTagList(language).upload;

  const { saveSettingLanguage } = useSaveSettingLanguage();

  const { imageValidator } = useCatImageValidator(language);

  const { imageUploader } = useCatImageUploader(language);

  return (
    <DefaultLayout metaTag={metaTag}>
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
