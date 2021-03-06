import { ImageList } from '../../../../domain/types/image';
import { FetchRandomImageList } from '../../../../domain/repositories/imageRepository';
import FetchRandomImageListError from '../../../../domain/errors/FetchRandomImageListError';
import { apiList } from '../../../../constants/url';

// eslint-disable-next-line import/prefer-default-export
export const fetchRandomImageList: FetchRandomImageList = async () => {
  const response = await fetch(apiList.fetchLgtmImages);

  if (!response.ok) {
    throw new FetchRandomImageListError();
  }

  return (await response.json()) as ImageList;
};
