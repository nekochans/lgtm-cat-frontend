import { httpStatusCode } from '../../constants';
import {
  FetchLgtmImagesError,
  IsAcceptableCatImageError,
  UploadCatImageError,
  UploadCatImageSizeTooLargeError,
  UploadCatImageValidationError,
  isLgtmImages,
  createFailureResult,
  createSuccessResult,
  fetchLgtmImagesUrl,
  fetchLgtmImagesInRecentlyCreatedUrl,
  isAcceptableCatImageUrl,
  uploadCatImageUrl,
  isUrl,
  type FetchLgtmImages,
  FetchLgtmImagesDto,
  LgtmImage,
  IsAcceptableCatImage,
  IsAcceptableCatImageResponse,
  UploadCatImage,
  LgtmImageUrl,
  Url,
} from '../../features';
import { mightSetRequestIdToSentry } from '../../utils';

type FetchImageResponseBody = {
  lgtmImages: {
    id: number;
    url: string;
  }[];
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

    return Object.hasOwn(lgtmImage, 'id') && Object.hasOwn(lgtmImage, 'url');
  }

  return false;
};

// eslint-disable-next-line max-statements
const fetchLgtmImages = async (
  dto: FetchLgtmImagesDto,
  fetchUrl: Url,
): Promise<LgtmImage[]> => {
  const options: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${dto.accessToken.jwtString}`,
    },
  };

  const response = await fetch(fetchUrl, options);
  if (!response.ok) {
    await mightSetRequestIdToSentry(response);

    throw new FetchLgtmImagesError(response.statusText);
  }

  const responseBody = await response.json();
  if (isFetchImageResponseBody(responseBody)) {
    const lgtmImages = responseBody.lgtmImages.map((value) => ({
      id: Number(value.id),
      imageUrl: value.url,
    }));

    if (isLgtmImages(lgtmImages)) {
      return lgtmImages;
    }
  }

  throw new FetchLgtmImagesError('ResponseBody is not expected');
};

// eslint-disable-next-line require-await
export const fetchLgtmImagesInRandom: FetchLgtmImages = async (dto) =>
  fetchLgtmImages(dto, fetchLgtmImagesUrl());

// eslint-disable-next-line require-await
export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (dto) =>
  fetchLgtmImages(dto, fetchLgtmImagesInRecentlyCreatedUrl());

export const isAcceptableCatImage: IsAcceptableCatImage = async (dto) => {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${dto.accessToken.jwtString}`,
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

    await mightSetRequestIdToSentry(response);

    throw new IsAcceptableCatImageError(response.statusText);
  }

  const isAcceptableCatImageResponse =
    (await response.json()) as IsAcceptableCatImageResponse;

  return createSuccessResult<IsAcceptableCatImageResponse>(
    isAcceptableCatImageResponse,
  );
};

type UploadCatImageResponseBody = {
  imageUrl: LgtmImageUrl;
};

const isUploadCatImageResponseBody = (
  value: unknown,
): value is UploadCatImageResponseBody => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const uploadCatImageResponseBody = value as UploadCatImageResponseBody;
  if (!Object.hasOwn(uploadCatImageResponseBody, 'imageUrl')) {
    return false;
  }

  return isUrl(uploadCatImageResponseBody.imageUrl);
};

export const uploadCatImage: UploadCatImage = async (dto) => {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${dto.accessToken.jwtString}`,
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
        await mightSetRequestIdToSentry(response);

        throw new UploadCatImageError(response.statusText);
    }
  }

  const uploadCatImageResponseBody = await response.json();

  if (isUploadCatImageResponseBody(uploadCatImageResponseBody)) {
    return createSuccessResult({
      createdLgtmImageUrl: uploadCatImageResponseBody.imageUrl,
    });
  }

  await mightSetRequestIdToSentry(response);

  throw new UploadCatImageError(response.statusText);
};
