import { ImageList, UploadedImage } from '../../../../domain/types/image';
import {
  FetchRandomImageList,
  UploadCatImage,
} from '../../../../domain/repositories/imageRepository';
import FetchRandomImageListError from '../../../../domain/errors/FetchRandomImageListError';
import { apiList } from '../../../../constants/url';

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

  // TODO response.status が 202 以外はエラーを返す

  return (await response.json()) as UploadedImage;
};
