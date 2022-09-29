import throttle from 'lodash/throttle';

import {
  issueAccessToken,
  fetchLgtmImagesInRandom,
  fetchLgtmImagesInRecentlyCreated,
} from '../api';

import type { LgtmImage } from '../features';

const randomCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  const accessToken = await issueAccessToken();

  return await fetchLgtmImagesInRandom({ accessToken });
};

const newArrivalCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  const accessToken = await issueAccessToken();

  return await fetchLgtmImagesInRecentlyCreated({ accessToken });
};

const limitThreshold = 1000;

export const useCatImagesFetcher = () => ({
  randomCatImagesFetcher: throttle<typeof randomCatImagesFetcher>(
    async () => await randomCatImagesFetcher(),
    limitThreshold
  ) as typeof randomCatImagesFetcher,
  newArrivalCatImagesFetcher: throttle<typeof newArrivalCatImagesFetcher>(
    async () => await newArrivalCatImagesFetcher(),
    limitThreshold
  ) as typeof newArrivalCatImagesFetcher,
});
