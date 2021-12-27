import { LgtmImages, UploadedImage } from '../types/lgtmImage';
import { RepositoryResult } from './repositoryResult';
import UploadCatImageAuthError from '../errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../errors/UploadCatImageSizeTooLargeError';
import UploadCatImageValidationError from '../errors/UploadCatImageValidationError';
import UploadCatImageUnexpectedError from '../errors/UploadCatImageUnexpectedError';

export type FetchLgtmImagesInRandom = () => Promise<LgtmImages>;

export type AcceptedTypesImageExtension = '.png' | '.jpg' | '.jpeg';

export type UploadCatImageRequest = {
  image: string;
  imageExtension: AcceptedTypesImageExtension;
};

export type UploadCatImage = (
  request: UploadCatImageRequest,
) => Promise<
  RepositoryResult<
    UploadedImage,
    | UploadCatImageAuthError
    | UploadCatImageSizeTooLargeError
    | UploadCatImageValidationError
    | UploadCatImageUnexpectedError
  >
>;
