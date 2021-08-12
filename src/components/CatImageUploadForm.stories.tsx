import React from 'react';
import CatImageUploadForm from './CatImageUploadForm';
import { UploadCatImage } from '../domain/repositories/imageRepository';
import {
  createFailureResult,
  createSuccessResult,
} from '../domain/repositories/repositoryResult';
import { UploadedImage } from '../domain/types/image';
import UploadCatImageAuthError from '../domain/errors/UploadCatImageAuthError';

export default {
  title: 'src/components/CatImageUploadForm.tsx',
  component: Error,
  includeStories: [
    'showSuccessCatImageUploadForm',
    'showAuthErrorCatImageUploadForm',
  ],
};

const mockSuccessUploadCatImage: UploadCatImage = (_request) => {
  const uploadedImage = {
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/35afef75-2d6d-4ca1-ab00-fb37f8848fca.webp',
  };

  return Promise.resolve(createSuccessResult<UploadedImage>(uploadedImage));
};

const mockUploadCatImageAuthError: UploadCatImage = (_request) =>
  Promise.resolve(
    createFailureResult<UploadCatImageAuthError>(new UploadCatImageAuthError()),
  );

export const showSuccessCatImageUploadForm = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockSuccessUploadCatImage} />
);

export const showAuthErrorCatImageUploadForm = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockUploadCatImageAuthError} />
);
