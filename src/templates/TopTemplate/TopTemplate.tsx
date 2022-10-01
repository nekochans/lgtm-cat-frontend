import type { FC } from 'react';
import { TopTemplate as OrgTopTemplate } from '@nekochans/lgtm-cat-ui';

import { InternalServerErrorImage } from '../../components';
import {
  metaTagList,
  appBaseUrl,
  languages,
  i18nUrlList,
  type Language,
  LgtmImage,
} from '../../features';
import { useCatImagesFetcher } from '../../hooks';
import { DefaultLayout } from '../../layouts';
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
  sendCopyMarkdownFromTopImages,
} from '../../utils';

const clipboardMarkdownCallback = sendCopyMarkdownFromTopImages;

const fetchRandomCatImagesCallback = sendClickTopFetchRandomCatButton;

const fetchNewArrivalCatImagesCallback = sendClickTopFetchNewArrivalCatButton;

const catRandomCopyCallback = sendCopyMarkdownFromRandomButton;

const canonicalLink = i18nUrlList.top?.ja;

const alternateUrls = languages.map((hreflang) => {
  const link = hreflang === 'ja' ? canonicalLink : i18nUrlList.top?.en;

  return { link, hreflang };
});

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
};

export const TopTemplate: FC<Props> = ({ language, lgtmImages }) => {
  const metaTag = metaTagList(language).top;

  const { randomCatImagesFetcher, newArrivalCatImagesFetcher } =
    useCatImagesFetcher();

  return (
    <DefaultLayout metaTag={metaTag} alternateUrls={alternateUrls}>
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
        catRandomCopyCallback={catRandomCopyCallback}
      />
    </DefaultLayout>
  );
};
