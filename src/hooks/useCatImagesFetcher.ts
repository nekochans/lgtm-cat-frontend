import {
  fetchLgtmImagesInRandom,
  fetchLgtmImagesInRecentlyCreated,
} from '@/api';
import type { CatImagesFetcher, LgtmImage } from '@/features';
import throttle from 'lodash/throttle';

const randomCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  return await fetchLgtmImagesInRandom();
};

const newArrivalCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  return await fetchLgtmImagesInRecentlyCreated();
};

const limitThreshold = 1000;

type UseCatImagesFetcherResponse = {
  randomCatImagesFetcher: CatImagesFetcher;
  newArrivalCatImagesFetcher: CatImagesFetcher;
};

export const useCatImagesFetcher = (): UseCatImagesFetcherResponse => ({
  randomCatImagesFetcher: throttle<typeof randomCatImagesFetcher>(
    async () => await randomCatImagesFetcher(),
    limitThreshold,
  ) as typeof randomCatImagesFetcher,
  newArrivalCatImagesFetcher: throttle<typeof newArrivalCatImagesFetcher>(
    async () => await newArrivalCatImagesFetcher(),
    limitThreshold,
  ) as typeof newArrivalCatImagesFetcher,
});
