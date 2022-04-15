import FetchLgtmImagesInRandomError from '../errors/FetchLgtmImagesInRandomError';
import FetchLgtmImagesInRecentlyCreatedAuthError from '../errors/FetchLgtmImagesInRecentlyCreatedAuthError';
import FetchLgtmImagesInRecentlyCreatedError from '../errors/FetchLgtmImagesInRecentlyCreatedError';
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

export type FetchLgtmImagesInRandom = (
  request: FetchLgtmImagesRequest,
) => Promise<RepositoryResult<LgtmImages, FetchLgtmImagesInRandomError>>;

export type FetchLgtmImagesInRecentlyCreated = (
  request: FetchLgtmImagesRequest,
) => Promise<
  RepositoryResult<
    LgtmImages,
    | FetchLgtmImagesInRecentlyCreatedAuthError
    | FetchLgtmImagesInRecentlyCreatedError
  >
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
