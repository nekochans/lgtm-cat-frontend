import {
  fetchLgtmImagesInRandom,
  fetchLgtmImagesInRecentlyCreated,
} from '@/api';
import type { CatImagesFetcher, LgtmImage, Url } from '@/features';
import throttle from 'lodash/throttle';

const randomCatImagesFetcher = async (
  appBaseUrl: Url,
): Promise<LgtmImage[]> => {
  return await fetchLgtmImagesInRandom(appBaseUrl);
};

const newArrivalCatImagesFetcher = async (
  appBaseUrl: Url,
): Promise<LgtmImage[]> => {
  return await fetchLgtmImagesInRecentlyCreated(appBaseUrl);
};

const limitThreshold = 1000;

type UseCatImagesFetcherResponse = {
  randomCatImagesFetcher: CatImagesFetcher;
  newArrivalCatImagesFetcher: CatImagesFetcher;
};

export const useCatImagesFetcher = (
  appBaseUrl: Url,
): UseCatImagesFetcherResponse => ({
  randomCatImagesFetcher: throttle<typeof randomCatImagesFetcher>(
    async () => await randomCatImagesFetcher(appBaseUrl),
    limitThreshold,
  ) as typeof randomCatImagesFetcher,
  newArrivalCatImagesFetcher: throttle<typeof newArrivalCatImagesFetcher>(
    async () => await newArrivalCatImagesFetcher(appBaseUrl),
    limitThreshold,
  ) as typeof newArrivalCatImagesFetcher,
});
