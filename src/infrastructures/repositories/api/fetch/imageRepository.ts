import { LgtmImages, UploadedImage } from '../../../../domain/types/lgtmImage';
import {
  FetchLgtmImagesInRandom,
  UploadCatImage,
} from '../../../../domain/repositories/imageRepository';
import FetchLgtmImagesInRandomError from '../../../../domain/errors/FetchLgtmImagesInRandomError';
import { apiList } from '../../../../constants/url';
import { UploadedImageResponse } from '../../../../pages/api/lgtm/images';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import UploadCatImageAuthError from '../../../../domain/errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../../../../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageValidationError from '../../../../domain/errors/UploadCatImageValidationError';
import UploadCatImageUnexpectedError from '../../../../domain/errors/UploadCatImageUnexpectedError';

export const fetchLgtmImagesInRandomWithClient: FetchLgtmImagesInRandom =
  async () => {
    const response = await fetch(apiList.fetchLgtmImages);

    if (!response.ok) {
      return createFailureResult(new FetchLgtmImagesInRandomError());
    }

    const lgtmImages = (await response.json()) as LgtmImages;

    return createSuccessResult<LgtmImages>(lgtmImages);
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

  if (response.status !== 202) {
    // vercelのpayloadサイズリミットに引っかかった場合
    // https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
    if (response.status !== 413) {
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
