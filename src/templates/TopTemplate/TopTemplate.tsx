'use client';

import { InternalServerErrorImage, ResponsiveLayout } from '@/components';
import {
  NewArrivalCatImagesFetcherError,
  RandomCatImagesFetcherError,
  type Language,
  type LgtmImage,
  type Url,
} from '@/features';
import { useCatImagesFetcher, useSwitchLanguage } from '@/hooks';
import { updateIsFailedFetchLgtmImages, updateLgtmImages } from '@/stores';
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
  sendCopyMarkdownFromTopImages,
} from '@/utils';
import type { FC } from 'react';
import { LgtmImagesContents } from './LgtmImagesContents';

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
  appBaseUrl: Url;
};

export const TopTemplate: FC<Props> = ({
  language,
  lgtmImages,
  appBaseUrl,
}) => {
  const { randomCatImagesFetcher, newArrivalCatImagesFetcher } =
    useCatImagesFetcher(appBaseUrl);

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  const onClickFetchRandomCatButton = async () => {
    try {
      const lgtmImagesList = await randomCatImagesFetcher(appBaseUrl);

      updateLgtmImages(lgtmImagesList);
      updateIsFailedFetchLgtmImages(false);
      sendClickTopFetchRandomCatButton();
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
      const lgtmImagesList = await newArrivalCatImagesFetcher(appBaseUrl);

      updateLgtmImages(lgtmImagesList);
      updateIsFailedFetchLgtmImages(false);
      sendClickTopFetchNewArrivalCatButton();
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
          appUrl={appBaseUrl}
          catRandomCopyCallback={sendCopyMarkdownFromRandomButton}
          clipboardMarkdownCallback={sendCopyMarkdownFromTopImages}
        />
      </ResponsiveLayout>
    </div>
  );
};
