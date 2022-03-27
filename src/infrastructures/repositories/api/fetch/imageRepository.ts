import { httpStatusCode } from '../../../../constants/httpStatusCode';
import {
  fetchLgtmImagesUrl,
  uploadCatImageUrl,
} from '../../../../constants/url';
import FetchLgtmImagesInRandomAuthError from '../../../../domain/errors/FetchLgtmImagesInRandomAuthError';
import FetchLgtmImagesInRandomError from '../../../../domain/errors/FetchLgtmImagesInRandomError';
import UploadCatImageAuthError from '../../../../domain/errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../../../../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageUnexpectedError from '../../../../domain/errors/UploadCatImageUnexpectedError';
import UploadCatImageValidationError from '../../../../domain/errors/UploadCatImageValidationError';
import {
  FetchLgtmImagesInRandom,
  UploadCatImage,
} from '../../../../domain/repositories/imageRepository';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import { LgtmImages, UploadedImage } from '../../../../domain/types/lgtmImage';

export const fetchLgtmImagesInRandom: FetchLgtmImagesInRandom = async (
  request,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${request.accessToken.jwtString}`,
    },
  };

  const response = await fetch(fetchLgtmImagesUrl(), options);
  if (!response.ok) {
    if (response.status === httpStatusCode.unauthorized) {
      return createFailureResult(new FetchLgtmImagesInRandomAuthError());
    }

    return createFailureResult(new FetchLgtmImagesInRandomError());
  }

  const lgtmImages = (await response.json()) as LgtmImages;

  return createSuccessResult<LgtmImages>(lgtmImages);
};

export const uploadCatImage: UploadCatImage = async (request) => {
  const options = {
    method: 'POST',
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
