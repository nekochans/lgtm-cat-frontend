import type {
  AcceptedTypesImageExtension as OrgAcceptedTypesImageExtension,
  LgtmImage as OrgLgtmImage,
  LgtmImageUrl as OrgLgtmImageUrl,
  ImageUploader as OrgImageUploader,
  ImageValidator as OrgImageValidator,
  CatImagesFetcher as OrgCatImagesFetcher,
} from '@nekochans/lgtm-cat-ui';
import {
  type UploadCatImageError,
  type UploadCatImageSizeTooLargeError,
  type UploadCatImageValidationError,
} from './errors';
import { imageData } from './imageData';

import type { Result } from './result';

export type LgtmImage = OrgLgtmImage;

export type AcceptedTypesImageExtension = OrgAcceptedTypesImageExtension;

export type FetchLgtmImages = () => Promise<LgtmImage[]>;

export type IsAcceptableCatImageDto = {
  image: string;
  imageExtension: AcceptedTypesImageExtension;
};

export type IsAcceptableCatImageNotAcceptableReason =
  | 'not an allowed image extension'
  | 'not moderation image'
  | 'person face in the image'
  | 'not cat image'
  | 'an error has occurred';

export type IsAcceptableCatImageResponse = {
  isAcceptableCatImage: boolean;
  notAcceptableReason: IsAcceptableCatImageNotAcceptableReason;
};

export type IsAcceptableCatImage = (
  dto: IsAcceptableCatImageDto
) => Promise<
  Result<IsAcceptableCatImageResponse, UploadCatImageSizeTooLargeError>
>;

export type LgtmImageUrl = OrgLgtmImageUrl;

type UploadedImage = {
  createdLgtmImageUrl: LgtmImageUrl;
};

export type UploadCatImageDto = IsAcceptableCatImageDto;

export type UploadCatImage = (
  request: UploadCatImageDto
) => Promise<
  Result<
    UploadedImage,
    | UploadCatImageSizeTooLargeError
    | UploadCatImageValidationError
    | UploadCatImageError
  >
>;

export type CatImagesFetcher = OrgCatImagesFetcher;

export type ImageValidator = OrgImageValidator;

export type ImageUploader = OrgImageUploader;

export const isLgtmImages = (value: unknown): value is LgtmImage[] => {
  if (Array.isArray(value)) {
    // eslint-disable-next-line no-magic-numbers
    if (Object.prototype.toString.call(value[0]) !== '[object Object]') {
      return false;
    }

    // eslint-disable-next-line no-magic-numbers
    const lgtmImage = value[0] as LgtmImage;

    return (
      Object.hasOwn(lgtmImage, 'id') && Object.hasOwn(lgtmImage, 'imageUrl')
    );
  }

  return false;
};

// APIに障害が発生している場合に利用する
export const extractRandomImages = (numberToExtract: number): LgtmImage[] => {
  const copiedLgtmImages = [...imageData];
  const result = [];

  // eslint-disable-next-line id-length, no-magic-numbers
  for (let i = numberToExtract; i > 0; i -= 1) {
    // eslint-disable-next-line no-magic-numbers
    const rand = Math.floor(Math.random() * (copiedLgtmImages.length + 1)) - 1;
    // eslint-disable-next-line no-magic-numbers
    result.push(...copiedLgtmImages.splice(rand, 1));
  }

  return result;
};
