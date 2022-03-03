import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { apiList, fetchLgtmImagesUrl } from '../../../../constants/url';
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
  isSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import { LgtmImages, UploadedImage } from '../../../../domain/types/lgtmImage';
import { UploadedImageResponse } from '../../../../pages/api/lgtm/images';

import { issueAccessToken } from './authTokenRepository';

export const fetchLgtmImagesInRandomWithClient: FetchLgtmImagesInRandom =
  async () => {
    const response = await fetch(apiList.fetchLgtmImages);

    if (!response.ok) {
      return createFailureResult(new FetchLgtmImagesInRandomError());
    }

    const lgtmImages = (await response.json()) as LgtmImages;

    return createSuccessResult<LgtmImages>(lgtmImages);
  };

export const fetchLgtmImagesInRandomWithServer: FetchLgtmImagesInRandom =
  async () => {
    const accessTokenResult = await issueAccessToken();
    if (isSuccessResult(accessTokenResult)) {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessTokenResult.value.jwtString}`,
        },
      };

      const response = await fetch(fetchLgtmImagesUrl(), options);
      if (!response.ok) {
        return createFailureResult(new FetchLgtmImagesInRandomError());
      }

      const lgtmImages = (await response.json()) as LgtmImages;

      return createSuccessResult<LgtmImages>(lgtmImages);
    }

    return createFailureResult(new FetchLgtmImagesInRandomAuthError());
  };

export const uploadCatImage: UploadCatImage = async (request) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: request.image,
      imageExtension: request.imageExtension,
    }),
  };

  const response = await fetch(apiList.uploadCatImage, options);

  if (response.status !== httpStatusCode.accepted) {
    /*
     * Vercelのpayloadサイズリミットに引っかかった場合
     * https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
     */
    if (response.status === httpStatusCode.payloadTooLarge) {
      return createFailureResult<UploadCatImageSizeTooLargeError>(
        new UploadCatImageSizeTooLargeError(),
      );
    }

    const errorBody = (await response.json()) as UploadedImageResponse;

    // TODO メッセージを型安全に取り出せるようにリファクタリングする
    switch (errorBody.error?.message) {
      case 'IssueAccessTokenError':
        return createFailureResult<UploadCatImageAuthError>(
          new UploadCatImageAuthError(),
        );
      case 'UploadCatImageSizeTooLargeError':
        return createFailureResult<UploadCatImageSizeTooLargeError>(
          new UploadCatImageSizeTooLargeError(),
        );
      case 'UploadCatImageValidationError':
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
