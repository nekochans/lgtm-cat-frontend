import { ImageList, UploadedImage } from '../../../../domain/types/image';
import {
  FetchRandomImageList,
  UploadCatImage,
} from '../../../../domain/repositories/imageRepository';
import FetchRandomImageListError from '../../../../domain/errors/FetchRandomImageListError';
import { apiList } from '../../../../constants/url';
import { UploadedImageResponse } from '../../../../pages/api/lgtm/images';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import UploadCatImageAuthError from '../../../../domain/errors/UploadCatImageAuthError';

export const fetchRandomImageList: FetchRandomImageList = async () => {
  const response = await fetch(apiList.fetchLgtmImages);

  if (!response.ok) {
    throw new FetchRandomImageListError();
  }

  return (await response.json()) as ImageList;
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
    const errorBody = (await response.json()) as UploadedImageResponse;

    switch (errorBody.error?.message) {
      case 'IssueAccessTokenError':
        return createFailureResult<UploadCatImageAuthError>(
          new UploadCatImageAuthError(),
        );
      default:
        // TODO 後で例外的なエラーを定義する
        return createFailureResult<UploadCatImageAuthError>(
          new UploadCatImageAuthError(),
        );
    }
  }

  // TODO response.status が 202 以外はエラーを返す

  const uploadedImage = (await response.json()) as UploadedImage;

  return createSuccessResult<UploadedImage>(uploadedImage);
};
