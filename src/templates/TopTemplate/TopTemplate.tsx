import { InternalServerErrorImage, ResponsiveLayout } from '@/components';
import {
  appBaseUrl,
  i18nUrlList,
  languages,
  metaTagList,
  NewArrivalCatImagesFetcherError,
  RandomCatImagesFetcherError,
  type Language,
  type LgtmImage,
} from '@/features';
import { useCatImagesFetcher, useSwitchLanguage } from '@/hooks';
import { DefaultLayout } from '@/layouts';
import { updateIsFailedFetchLgtmImages, updateLgtmImages } from '@/stores';
import {
  type sendClickTopFetchNewArrivalCatButton,
  type sendClickTopFetchRandomCatButton,
  type sendCopyMarkdownFromRandomButton,
  type sendCopyMarkdownFromTopImages,
} from '@/utils';
import type { FC } from 'react';
import { LgtmImagesContents } from './LgtmImagesContents';

const alternateUrls = languages.map((hreflang) => {
  const link = hreflang === 'ja' ? i18nUrlList.top?.ja : i18nUrlList.top?.en;

  return { link, hreflang };
});

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
  callbackFunctions?: {
    clipboardMarkdownCallback?: typeof sendCopyMarkdownFromTopImages;
    fetchRandomCatImagesCallback?: typeof sendClickTopFetchRandomCatButton;
    fetchNewArrivalCatImagesCallback?: typeof sendClickTopFetchNewArrivalCatButton;
    catRandomCopyCallback?: typeof sendCopyMarkdownFromRandomButton;
  };
};

export const TopTemplate: FC<Props> = ({
  language,
  lgtmImages,
  callbackFunctions,
}) => {
  const metaTag = metaTagList(language).top;

  const canonicalLink =
    language === 'en' ? i18nUrlList.top?.en : i18nUrlList.top?.ja;

  const { randomCatImagesFetcher, newArrivalCatImagesFetcher } =
    useCatImagesFetcher();

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  const onClickFetchRandomCatButton = async () => {
    try {
      const lgtmImagesList = await randomCatImagesFetcher();

      updateLgtmImages(lgtmImagesList);
      updateIsFailedFetchLgtmImages(false);

      if (callbackFunctions?.fetchRandomCatImagesCallback) {
        callbackFunctions.fetchRandomCatImagesCallback();
      }
    } catch (error) {
      updateIsFailedFetchLgtmImages(true);
      if (error instanceof Error) {
        throw new RandomCatImagesFetcherError(error.message);
      }

      throw new RandomCatImagesFetcherError('failed to randomCatImagesFetcher');
    }
  };

  const onClickFetchNewArrivalCatButton = async () => {
    try {
      const lgtmImagesList = await newArrivalCatImagesFetcher();

      updateLgtmImages(lgtmImagesList);
      updateIsFailedFetchLgtmImages(false);

      if (callbackFunctions?.fetchNewArrivalCatImagesCallback) {
        callbackFunctions.fetchNewArrivalCatImagesCallback();
      }
    } catch (error) {
      updateIsFailedFetchLgtmImages(true);
      if (error instanceof Error) {
        throw new NewArrivalCatImagesFetcherError(error.message);
      }

      throw new RandomCatImagesFetcherError(
        'failed to newArrivalCatImagesFetcher',
      );
    }
  };

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
          currentUrlPath="/"
        >
          <LgtmImagesContents
            language={language}
            lgtmImages={lgtmImages}
            errorCatImage={<InternalServerErrorImage />}
            onClickFetchRandomCatButton={onClickFetchRandomCatButton}
            onClickFetchNewArrivalCatButton={onClickFetchNewArrivalCatButton}
            appUrl={appBaseUrl()}
            catRandomCopyCallback={callbackFunctions?.catRandomCopyCallback}
            clipboardMarkdownCallback={
              callbackFunctions?.clipboardMarkdownCallback
            }
          />
        </ResponsiveLayout>
      </div>
    </DefaultLayout>
  );
};
