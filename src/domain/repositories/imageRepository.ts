import { ImageList, UploadedImage } from '../types/image';

export type FetchRandomImageList = () => Promise<ImageList>;

export type AcceptedTypesImageExtension = '.png' | '.jpg' | '.jpeg';

export type UploadCatImageRequest = {
  image: string;
  imageExtension: AcceptedTypesImageExtension;
};

export type UploadCatImage = (
  request: UploadCatImageRequest,
) => Promise<UploadedImage>;
