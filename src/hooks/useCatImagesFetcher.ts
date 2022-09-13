import throttle from 'lodash/throttle';

import {
  issueAccessToken,
  fetchLgtmImagesInRandom,
  fetchLgtmImagesInRecentlyCreated,
} from '../api';

import type { LgtmImage } from '../features';

const randomCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  const accessToken = await issueAccessToken();

  return fetchLgtmImagesInRandom({ accessToken });
};

const newArrivalCatImagesFetcher = async (): Promise<LgtmImage[]> => {
  const accessToken = await issueAccessToken();

  return fetchLgtmImagesInRecentlyCreated({ accessToken });
};

const limitThreshold = 1000;

export const useCatImagesFetcher = () => ({
  randomCatImagesFetcher: throttle<typeof randomCatImagesFetcher>(
    () => randomCatImagesFetcher(),
    limitThreshold,
  ) as typeof randomCatImagesFetcher,
  newArrivalCatImagesFetcher: throttle<typeof newArrivalCatImagesFetcher>(
    () => newArrivalCatImagesFetcher(),
    limitThreshold,
  ) as typeof newArrivalCatImagesFetcher,
});
