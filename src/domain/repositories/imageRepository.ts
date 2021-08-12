import { ImageList, UploadedImage } from '../types/image';
import { RepositoryResult } from './repositoryResult';
import UploadCatImageAuthError from '../errors/UploadCatImageAuthError';

export type FetchRandomImageList = () => Promise<ImageList>;

export type AcceptedTypesImageExtension = '.png' | '.jpg' | '.jpeg';

export type UploadCatImageRequest = {
  image: string;
  imageExtension: AcceptedTypesImageExtension;
};

export type UploadCatImage = (
  request: UploadCatImageRequest,
) => Promise<RepositoryResult<UploadedImage, UploadCatImageAuthError | Error>>;
