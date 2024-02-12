import type { LgtmImage } from '@/features';
import { proxy } from 'valtio';

export type LgtmImageState = {
  lgtmImages?: LgtmImage[];
  isFailedFetchLgtmImages?: boolean;
};

const lgtmImageState = proxy<LgtmImageState>({});

export const updateLgtmImages = (lgtmImages: LgtmImage[]): void => {
  lgtmImageState.lgtmImages = lgtmImages;
};

export const updateIsFailedFetchLgtmImages = (
  isFailedFetchLgtmImages: boolean,
): void => {
  lgtmImageState.isFailedFetchLgtmImages = isFailedFetchLgtmImages;
};

export const lgtmImageStateSelector = (): LgtmImageState => lgtmImageState;
