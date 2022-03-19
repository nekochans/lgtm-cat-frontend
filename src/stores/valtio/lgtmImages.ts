import { proxy } from 'valtio';

import { LgtmImage } from '../../domain/types/lgtmImage';

export type LgtmImageState = {
  lgtmImages: LgtmImage[];
  isFailedFetchLgtmImages: boolean;
};

const lgtmImageState = proxy<LgtmImageState>({
  lgtmImages: [],
  isFailedFetchLgtmImages: false,
});

export const updateLgtmImages = (lgtmImages: LgtmImage[]): void => {
  lgtmImageState.lgtmImages = lgtmImages;
};

export const updateIsFailedFetchLgtmImages = (
  isFailedFetchLgtmImages: boolean,
): void => {
  lgtmImageState.isFailedFetchLgtmImages = isFailedFetchLgtmImages;
};

export const lgtmImageStateSelector = (): LgtmImageState => lgtmImageState;
