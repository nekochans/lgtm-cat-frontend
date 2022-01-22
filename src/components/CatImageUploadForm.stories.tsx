import React from 'react';

import UploadCatImageAuthError from '../domain/errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageUnexpectedError from '../domain/errors/UploadCatImageUnexpectedError';
import UploadCatImageValidationError from '../domain/errors/UploadCatImageValidationError';
import { UploadCatImage } from '../domain/repositories/imageRepository';
import {
  createFailureResult,
  createSuccessResult,
} from '../domain/repositories/repositoryResult';
import { UploadedImage } from '../domain/types/lgtmImage';

import CatImageUploadForm from './CatImageUploadForm';

export default {
  title: 'src/components/CatImageUploadForm.tsx',
  component: Error,
  includeStories: [
    'showCatImageUploadForm',
    'showCatImageUploadFormWithAuthError',
    'showCatImageUploadFormWithImageSizeTooLargeError',
    'showCatImageUploadFormWithValidationError',
    'showCatImageUploadFormWithUnexpectedError',
  ],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSuccessUploadCatImage: UploadCatImage = async (_request) => {
  const uploadedImage = {
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/35afef75-2d6d-4ca1-ab00-fb37f8848fca.webp',
  };

  await sleep(3000);

  return createSuccessResult<UploadedImage>(uploadedImage);
};

const mockUploadCatImageAuthError: UploadCatImage = (_request) =>
  Promise.resolve(
    createFailureResult<UploadCatImageAuthError>(new UploadCatImageAuthError()),
  );

const mockUploadCatImageSizeTooLargeError: UploadCatImage = (_request) =>
  Promise.resolve(
    createFailureResult<UploadCatImageSizeTooLargeError>(
      new UploadCatImageSizeTooLargeError(),
    ),
  );

const mockUploadCatImageValidationError: UploadCatImage = (_request) =>
  Promise.resolve(
    createFailureResult<UploadCatImageValidationError>(
      new UploadCatImageValidationError(),
    ),
  );

const mockUploadCatImageUnexpectedError: UploadCatImage = (_request) =>
  Promise.resolve(
    createFailureResult<UploadCatImageUnexpectedError>(
      new UploadCatImageUnexpectedError(),
    ),
  );

export const showCatImageUploadForm = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockSuccessUploadCatImage} />
);

export const showCatImageUploadFormWithAuthError = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockUploadCatImageAuthError} />
);

export const showCatImageUploadFormWithImageSizeTooLargeError =
  (): JSX.Element => (
    <CatImageUploadForm uploadCatImage={mockUploadCatImageSizeTooLargeError} />
  );

export const showCatImageUploadFormWithValidationError = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockUploadCatImageValidationError} />
);

export const showCatImageUploadFormWithUnexpectedError = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockUploadCatImageUnexpectedError} />
);
