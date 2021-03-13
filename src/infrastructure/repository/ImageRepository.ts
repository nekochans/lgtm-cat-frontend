import { ImageList } from '../../domain/image';
import { urlList } from '../../constants/url';
import { FetchRandomImageList } from '../../domain/repository';

// eslint-disable-next-line import/prefer-default-export
export const fetchRandomImageList: FetchRandomImageList = async () => {
  const url = `${urlList.top}/api/lgtm/images`;
  const response = await fetch(url);

  if (!response.ok) {
    // TODO
  }

  return (await response.json()) as ImageList;
};
