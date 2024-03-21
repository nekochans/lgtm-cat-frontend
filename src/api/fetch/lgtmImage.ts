import { httpStatusCode } from '@/constants';
import {
  createFailureResult,
  createSuccessResult,
  FetchLgtmImagesError,
  fetchLgtmImagesInRecentlyCreatedUrl,
  fetchLgtmImagesUrl,
  IsAcceptableCatImageError,
  isAcceptableCatImageUrl,
  isUrl,
  UploadCatImageError,
  UploadCatImageSizeTooLargeError,
  uploadCatImageUrl,
  UploadCatImageValidationError,
  type FetchLgtmImages,
  type IsAcceptableCatImage,
  type IsAcceptableCatImageResponse,
  type LgtmImage,
  type LgtmImageUrl,
  type UploadCatImage,
} from '@/features';
import { mightSetRequestIdToSentry } from '@/utils';

// eslint-disable-next-line require-await
export const fetchLgtmImagesInRandom: FetchLgtmImages = async (
  appBaseUrl,
  revalidate,
) => {
  const options = {
    method: 'GET',
    next: { revalidate },
  };

  const response = await fetch(`${fetchLgtmImagesUrl(appBaseUrl)}`, options);
  if (!response.ok) {
    mightSetRequestIdToSentry(response);

    throw new FetchLgtmImagesError(response.statusText);
  }

  return (await response.json()) as LgtmImage[];
};

// eslint-disable-next-line require-await
export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (
  appBaseUrl,
  revalidate,
) => {
  const options: RequestInit =
    revalidate != null
      ? {
          method: 'GET',
          next: { revalidate },
        }
      : {
          method: 'GET',
        };

  const response = await fetch(
    `${fetchLgtmImagesInRecentlyCreatedUrl(appBaseUrl)}`,
    options,
  );
  if (!response.ok) {
    mightSetRequestIdToSentry(response);

    throw new FetchLgtmImagesError(response.statusText);
  }

  return (await response.json()) as LgtmImage[];
};

export const isAcceptableCatImage: IsAcceptableCatImage = async (dto) => {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: dto.image,
      imageExtension: dto.imageExtension,
    }),
  };

  const response = await fetch(
    isAcceptableCatImageUrl(dto.appBaseUrl),
    options,
  );

  if (response.status !== httpStatusCode.ok) {
    if (response.status === httpStatusCode.payloadTooLarge) {
      return createFailureResult<UploadCatImageSizeTooLargeError>(
        new UploadCatImageSizeTooLargeError(),
      );
    }

    mightSetRequestIdToSentry(response);

    throw new IsAcceptableCatImageError(response.statusText);
  }

  const isAcceptableCatImageResponse =
    (await response.json()) as IsAcceptableCatImageResponse;

  return createSuccessResult<IsAcceptableCatImageResponse>(
    isAcceptableCatImageResponse,
  );
};

type UploadCatImageResponseBody = {
  createdLgtmImageUrl: LgtmImageUrl;
};

const isUploadCatImageResponseBody = (
  value: unknown,
): value is UploadCatImageResponseBody => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const uploadCatImageResponseBody = value as UploadCatImageResponseBody;
  if (!Object.hasOwn(uploadCatImageResponseBody, 'createdLgtmImageUrl')) {
    return false;
  }

  return isUrl(uploadCatImageResponseBody.createdLgtmImageUrl);
};

export const uploadCatImage: UploadCatImage = async (dto) => {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: dto.image,
      imageExtension: dto.imageExtension,
    }),
  };

  const response = await fetch(uploadCatImageUrl(), options);

  if (response.status !== httpStatusCode.accepted) {
    switch (response.status) {
      case httpStatusCode.payloadTooLarge:
        return createFailureResult<UploadCatImageSizeTooLargeError>(
          new UploadCatImageSizeTooLargeError(),
        );
      case httpStatusCode.unprocessableEntity:
        return createFailureResult<UploadCatImageValidationError>(
          new UploadCatImageValidationError(),
        );
      default:
        mightSetRequestIdToSentry(response);

        throw new UploadCatImageError(response.statusText);
    }
  }

  const uploadCatImageResponseBody =
    (await response.json()) as UploadCatImageResponseBody;

  if (isUploadCatImageResponseBody(uploadCatImageResponseBody)) {
    return createSuccessResult({
      createdLgtmImageUrl: uploadCatImageResponseBody.createdLgtmImageUrl,
    });
  }

  mightSetRequestIdToSentry(response);

  throw new UploadCatImageError(response.statusText);
};
