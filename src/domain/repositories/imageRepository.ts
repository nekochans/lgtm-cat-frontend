import FetchLgtmImagesAuthError from '../errors/FetchLgtmImagesAuthError';
import FetchLgtmImagesError from '../errors/FetchLgtmImagesError';
import UploadCatImageAuthError from '../errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../errors/UploadCatImageSizeTooLargeError';
import UploadCatImageUnexpectedError from '../errors/UploadCatImageUnexpectedError';
import UploadCatImageValidationError from '../errors/UploadCatImageValidationError';
import { AccessToken } from '../types/authToken';
import { LgtmImages, UploadedImage } from '../types/lgtmImage';

import { RepositoryResult } from './repositoryResult';

export type FetchLgtmImagesRequest = {
  accessToken: AccessToken;
};

export type FetchLgtmImages = (
  request: FetchLgtmImagesRequest,
) => Promise<
  RepositoryResult<LgtmImages, FetchLgtmImagesError | FetchLgtmImagesAuthError>
>;

export type AcceptedTypesImageExtension = '.png' | '.jpg' | '.jpeg';

export type UploadCatImageRequest = {
  accessToken: AccessToken;
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
