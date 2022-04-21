import { httpStatusCode } from '../../../../constants/httpStatusCode';
import {
  fetchLgtmImagesInRecentlyCreatedUrl,
  fetchLgtmImagesUrl,
  uploadCatImageUrl,
} from '../../../../constants/url';
import FetchLgtmImagesAuthError from '../../../../domain/errors/FetchLgtmImagesAuthError';
import FetchLgtmImagesError from '../../../../domain/errors/FetchLgtmImagesError';
import UploadCatImageAuthError from '../../../../domain/errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../../../../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageUnexpectedError from '../../../../domain/errors/UploadCatImageUnexpectedError';
import UploadCatImageValidationError from '../../../../domain/errors/UploadCatImageValidationError';
import {
  FetchLgtmImages,
  UploadCatImage,
} from '../../../../domain/repositories/imageRepository';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import { LgtmImages, UploadedImage } from '../../../../domain/types/lgtmImage';

export const fetchLgtmImagesInRandom: FetchLgtmImages = async (request) => {
  const options: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${request.accessToken.jwtString}`,
    },
  };

  const response = await fetch(fetchLgtmImagesUrl(), options);
  if (!response.ok) {
    if (response.status === httpStatusCode.unauthorized) {
      return createFailureResult(new FetchLgtmImagesAuthError());
    }

    return createFailureResult(new FetchLgtmImagesError());
  }

  const lgtmImages = (await response.json()) as LgtmImages;

  return createSuccessResult<LgtmImages>(lgtmImages);
};

export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (
  request,
) => {
  const options: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${request.accessToken.jwtString}`,
    },
  };

  const response = await fetch(fetchLgtmImagesInRecentlyCreatedUrl(), options);
  if (!response.ok) {
    if (response.status === httpStatusCode.unauthorized) {
      return createFailureResult(new FetchLgtmImagesAuthError());
    }

    return createFailureResult(new FetchLgtmImagesError());
  }

  const lgtmImages = (await response.json()) as LgtmImages;

  return createSuccessResult<LgtmImages>(lgtmImages);
};

export const uploadCatImage: UploadCatImage = async (request) => {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${request.accessToken.jwtString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: request.image,
      imageExtension: request.imageExtension,
    }),
  };

  const response = await fetch(uploadCatImageUrl(), options);

  if (response.status !== httpStatusCode.accepted) {
    switch (response.status) {
      case httpStatusCode.unauthorized:
        return createFailureResult<UploadCatImageAuthError>(
          new UploadCatImageAuthError(),
        );
      case httpStatusCode.payloadTooLarge:
        return createFailureResult<UploadCatImageSizeTooLargeError>(
          new UploadCatImageSizeTooLargeError(),
        );
      case httpStatusCode.unprocessableEntity:
        return createFailureResult<UploadCatImageValidationError>(
          new UploadCatImageValidationError(),
        );
      default:
        return createFailureResult<UploadCatImageUnexpectedError>(
          new UploadCatImageUnexpectedError(),
        );
    }
  }

  const uploadedImage = (await response.json()) as UploadedImage;

  return createSuccessResult<UploadedImage>(uploadedImage);
};
