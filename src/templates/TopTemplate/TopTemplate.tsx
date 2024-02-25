'use client';

import { InternalServerErrorImage, ResponsiveLayout } from '@/components';
import {
  appBaseUrl,
  NewArrivalCatImagesFetcherError,
  RandomCatImagesFetcherError,
  type Language,
  type LgtmImage,
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
};

export const TopTemplate: FC<Props> = ({ language, lgtmImages }) => {
  const { randomCatImagesFetcher, newArrivalCatImagesFetcher } =
    useCatImagesFetcher();

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  const onClickFetchRandomCatButton = async () => {
    try {
      const lgtmImagesList = await randomCatImagesFetcher();

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
      const lgtmImagesList = await newArrivalCatImagesFetcher();

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
          errorCatImage={<InternalServerErrorImage/>}
          onClickFetchRandomCatButton={onClickFetchRandomCatButton}
          onClickFetchNewArrivalCatButton={onClickFetchNewArrivalCatButton}
          appUrl={appBaseUrl()}
          catRandomCopyCallback={sendCopyMarkdownFromRandomButton}
          clipboardMarkdownCallback={sendCopyMarkdownFromTopImages}
        />
      </ResponsiveLayout>
    </div>
  );
};
