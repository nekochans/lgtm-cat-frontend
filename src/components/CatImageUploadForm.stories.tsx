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
import sleep from '../infrastructures/utils/sleep';

import CatImageUploadForm from './CatImageUploadForm';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/CatImageUploadForm.tsx',
  component: CatImageUploadForm,
} as Meta<typeof CatImageUploadForm>;

type Story = ComponentStoryObj<typeof CatImageUploadForm>;

const mockSuccessUploadCatImage: UploadCatImage = async (_request) => {
  const uploadedImage = {
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/35afef75-2d6d-4ca1-ab00-fb37f8848fca.webp',
  };

  const waitSeconds = 3;

  await sleep(waitSeconds);

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

export const UploadWillBeSuccessful: Story = {
  args: {
    uploadCatImage: mockSuccessUploadCatImage,
  },
};

export const UploadingWillResultInAnAuthError: Story = {
  args: {
    uploadCatImage: mockUploadCatImageAuthError,
  },
};

export const UploadingWillResultInImageSizeTooLargeError: Story = {
  args: {
    uploadCatImage: mockUploadCatImageSizeTooLargeError,
  },
};

export const UploadingWillResultInValidationError: Story = {
  args: {
    uploadCatImage: mockUploadCatImageValidationError,
  },
};

export const UploadingWillResultInAnUnexpectedError: Story = {
  args: {
    uploadCatImage: mockUploadCatImageUnexpectedError,
  },
};
