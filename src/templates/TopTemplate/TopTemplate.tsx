import { InternalServerErrorImage } from '@/components';
import {
  appBaseUrl,
  i18nUrlList,
  languages,
  metaTagList,
  type Language,
  type LgtmImage,
} from '@/features';
import { useCatImagesFetcher } from '@/hooks';
import { DefaultLayout } from '@/layouts';
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
  sendCopyMarkdownFromTopImages,
} from '@/utils';
import { TopTemplate as OrgTopTemplate } from '@nekochans/lgtm-cat-ui';
import type { FC } from 'react';

const clipboardMarkdownCallback = sendCopyMarkdownFromTopImages;

const fetchRandomCatImagesCallback = sendClickTopFetchRandomCatButton;

const fetchNewArrivalCatImagesCallback = sendClickTopFetchNewArrivalCatButton;

const catRandomCopyCallback = sendCopyMarkdownFromRandomButton;

const alternateUrls = languages.map((hreflang) => {
  const link = hreflang === 'ja' ? i18nUrlList.top?.ja : i18nUrlList.top?.en;

  return { link, hreflang };
});

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
};

export const TopTemplate: FC<Props> = ({ language, lgtmImages }) => {
  const metaTag = metaTagList(language).top;

  const canonicalLink =
    language === 'en' ? i18nUrlList.top?.en : i18nUrlList.top?.ja;

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
        catRandomCopyCallback={catRandomCopyCallback}
      />
    </DefaultLayout>
  );
};
