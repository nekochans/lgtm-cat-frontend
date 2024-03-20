import type { Url } from '@/features/url';
import {
  NotAllowedImageExtensionError,
  type UploadCatImageError,
  type UploadCatImageSizeTooLargeError,
  type UploadCatImageValidationError,
} from './errors';
import { imageData } from './imageData';
import type { Result, SuccessResult } from './result';

export type LgtmImageUrl = `https://${string}`;

export type LgtmImage = { id: number; imageUrl: LgtmImageUrl };

export type AcceptedTypesImageExtension = '.png' | '.jpg' | '.jpeg';

export type FetchLgtmImages = (
  appBaseUrl?: Url,
  revalidate?: number,
) => Promise<LgtmImage[]>;

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
  dto: IsAcceptableCatImageDto,
) => Promise<
  Result<IsAcceptableCatImageResponse, UploadCatImageSizeTooLargeError>
>;

type UploadedImage = {
  createdLgtmImageUrl: LgtmImageUrl;
};

export type UploadCatImageDto = IsAcceptableCatImageDto;

export type UploadCatImage = (
  request: UploadCatImageDto,
) => Promise<
  Result<
    UploadedImage,
    | UploadCatImageSizeTooLargeError
    | UploadCatImageValidationError
    | UploadCatImageError
  >
>;

export type CatImagesFetcher = (appBaseUrl: Url) => Promise<LgtmImage[]>;

export type ImageValidator = (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => Promise<
  SuccessResult<{
    isAcceptableCatImage: boolean;
    notAcceptableReason: string[];
  }>
>;

export type ImageUploader = (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => Promise<
  SuccessResult<{
    displayErrorMessages: string[];
    createdLgtmImageUrl?: LgtmImageUrl;
  }>
>;

export const isLgtmImageUrl = (value: unknown): value is LgtmImageUrl => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.startsWith('https://');
};

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

const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

export const isValidFileType = (fileType: string): boolean =>
  acceptedTypes.includes(fileType);

export const extractImageExtFromValidFileType = (
  fileType: string,
): AcceptedTypesImageExtension => {
  if (!isValidFileType(fileType)) {
    throw new NotAllowedImageExtensionError(
      `${fileType} is not an allowed image extension`,
    );
  }

  return `.${fileType.replace('image/', '')}` as AcceptedTypesImageExtension;
};

const calculateFileSize = (file: File): number => {
  const kb = 1024;
  // eslint-disable-next-line no-magic-numbers
  const mb = kb ** 2;

  // eslint-disable-next-line no-magic-numbers
  return Math.round((file.size / mb) * 100.0) / 100.0;
};

const acceptableSizeThreshold = 4;

export const acceptableImageSizeThresholdText = `${acceptableSizeThreshold}MB`;

export const isAcceptableFileSize = (file: File): boolean => {
  const size = calculateFileSize(file);

  return size <= acceptableSizeThreshold;
};
