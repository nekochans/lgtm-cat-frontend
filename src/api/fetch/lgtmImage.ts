import { httpStatusCode } from '@/constants';
import {
  createFailureResult,
  createSuccessResult,
  FetchLgtmImagesError,
  fetchLgtmImagesInRecentlyCreatedUrl,
  fetchLgtmImagesUrl,
  IsAcceptableCatImageError,
  isAcceptableCatImageUrl,
  isLgtmImages,
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
  type Url,
} from '@/features';
import { mightSetRequestIdToSentry } from '@/utils';

type FetchImageResponseBody = {
  lgtmImages: Array<{
    id: number;
    imageUrl: string;
  }>;
};

// eslint-disable-next-line max-statements
const isFetchImageResponseBody = (
  value: unknown,
): value is FetchImageResponseBody => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const fetchImageResponseBody = value as FetchImageResponseBody;
  if (!Object.hasOwn(fetchImageResponseBody, 'lgtmImages')) {
    return false;
  }

  if (Array.isArray(fetchImageResponseBody.lgtmImages)) {
    // eslint-disable-next-line no-magic-numbers
    if (fetchImageResponseBody.lgtmImages.length === 0) {
      return false;
    }

    // eslint-disable-next-line prefer-destructuring, no-magic-numbers
    const lgtmImage = fetchImageResponseBody.lgtmImages[0];
    if (Object.prototype.toString.call(lgtmImage) !== '[object Object]') {
      return false;
    }

    return (
      Object.hasOwn(lgtmImage, 'id') && Object.hasOwn(lgtmImage, 'imageUrl')
    );
  }

  return false;
};

// eslint-disable-next-line max-statements
const fetchLgtmImages = async (
  fetchUrl: Url,
  revalidate?: number,
): Promise<LgtmImage[]> => {
  const options: RequestInit =
    revalidate != null
      ? {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          next: { revalidate },
        }
      : {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
        };

  const response = await fetch(fetchUrl, options);
  if (!response.ok) {
    mightSetRequestIdToSentry(response);

    throw new FetchLgtmImagesError(response.statusText);
  }

  const responseBody = (await response.json()) as FetchImageResponseBody;
  if (isFetchImageResponseBody(responseBody)) {
    const lgtmImages = responseBody.lgtmImages.map((value) => ({
      id: Number(value.id),
      imageUrl: value.imageUrl,
    }));

    if (isLgtmImages(lgtmImages)) {
      return lgtmImages;
    }
  }

  throw new FetchLgtmImagesError('ResponseBody is not expected');
};

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
// await fetchLgtmImages(fetchLgtmImagesUrl(), revalidate);

// eslint-disable-next-line require-await
export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (
  appBaseUrl,
  revalidate,
) => await fetchLgtmImages(fetchLgtmImagesInRecentlyCreatedUrl(), revalidate);

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

  const response = await fetch(isAcceptableCatImageUrl(), options);

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
