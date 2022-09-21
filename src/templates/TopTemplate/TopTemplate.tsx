import { TopTemplate as OrgTopTemplate } from '@nekochans/lgtm-cat-ui';

import { InternalServerErrorImage } from '../../components';
import {
  metaTagList,
  appBaseUrl,
  languages,
  appUrlList,
  type Language,
  LgtmImage,
} from '../../features';
import { useSaveSettingLanguage, useCatImagesFetcher } from '../../hooks';
import { DefaultLayout } from '../../layouts';
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromTopImages,
} from '../../utils';

import type { FC } from 'react';

const clipboardMarkdownCallback = sendCopyMarkdownFromTopImages;

const fetchRandomCatImagesCallback = sendClickTopFetchRandomCatButton;

const fetchNewArrivalCatImagesCallback = sendClickTopFetchNewArrivalCatButton;

const canonicalLink = `${appUrlList.top}/` as const;

const alternateUrls = languages.map((hreflang) => {
  const link =
    hreflang === 'ja'
      ? canonicalLink
      : (`${canonicalLink}${hreflang}/` as const);

  return { link, hreflang };
});

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
};

export const TopTemplate: FC<Props> = ({ language, lgtmImages }) => {
  const metaTag = metaTagList(language).top;

  const { saveSettingLanguage } = useSaveSettingLanguage();

  const { randomCatImagesFetcher, newArrivalCatImagesFetcher } =
    useCatImagesFetcher();

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
      <OrgTopTemplate
        language={language}
        lgtmImages={lgtmImages}
        randomCatImagesFetcher={randomCatImagesFetcher}
        newArrivalCatImagesFetcher={newArrivalCatImagesFetcher}
        errorCatImage={<InternalServerErrorImage />}
        appUrl={appBaseUrl()}
        fetchRandomCatImagesCallback={fetchRandomCatImagesCallback}
        fetchNewArrivalCatImagesCallback={fetchNewArrivalCatImagesCallback}
        clipboardMarkdownCallback={clipboardMarkdownCallback}
        changeLanguageCallback={saveSettingLanguage}
      />
    </DefaultLayout>
  );
};
