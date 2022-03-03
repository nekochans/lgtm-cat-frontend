import { rest } from 'msw';

import { apiList, cognitoTokenEndpointUrl } from '../constants/url';
import { UploadCatImage } from '../domain/repositories/imageRepository';
import { createSuccessResult } from '../domain/repositories/repositoryResult';
import { UploadedImage } from '../domain/types/lgtmImage';
import { uploadCatImage } from '../infrastructures/repositories/api/fetch/imageRepository';
import sleep from '../infrastructures/utils/sleep';
import mockInternalServerError from '../mocks/api/error/mockInternalServerError';
import mockTokenEndpoint from '../mocks/api/external/cognito/mockTokenEndpoint';
import mockUploadCatImage from '../mocks/api/lgtm/images/mockUploadCatImage';
import mockUploadCatImageIssueAccessTokenError from '../mocks/api/lgtm/images/mockUploadCatImageIssueAccessTokenError';
import mockUploadCatImagePayloadTooLarge from '../mocks/api/lgtm/images/mockUploadCatImagePayloadTooLarge';
import mockUploadCatImageUnprocessableEntity from '../mocks/api/lgtm/images/mockUploadCatImageUnprocessableEntity';

import CatImageUploadForm from './CatImageUploadForm';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/CatImageUploadForm.tsx',
  component: CatImageUploadForm,
} as Meta<typeof CatImageUploadForm>;

type Story = ComponentStoryObj<typeof CatImageUploadForm>;

export const UploadWillBeSuccessful: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(cognitoTokenEndpointUrl(), mockTokenEndpoint),
        rest.post(apiList.uploadCatImage, mockUploadCatImage),
      ],
    },
  },
};

const mockSuccessUploadCatImage: UploadCatImage = async (_request) => {
  const uploadedImage = {
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/35afef75-2d6d-4ca1-ab00-fb37f8848fca.webp',
  };

  const waitSeconds = 3;

  await sleep(waitSeconds);

  return createSuccessResult<UploadedImage>(uploadedImage);
};

export const UploadWillBeSuccessfulWithLoadingMessage: Story = {
  args: {
    uploadCatImage: mockSuccessUploadCatImage,
  },
};

export const UploadingWillResultInAnAuthError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          apiList.uploadCatImage,
          mockUploadCatImageIssueAccessTokenError,
        ),
      ],
    },
  },
};

export const UploadingWillResultInImageSizeTooLargeError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(apiList.uploadCatImage, mockUploadCatImagePayloadTooLarge),
      ],
    },
  },
};

export const UploadingWillResultInValidationError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          apiList.uploadCatImage,
          mockUploadCatImageUnprocessableEntity,
        ),
      ],
    },
  },
};

export const UploadingWillResultInAnUnexpectedError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [rest.post(apiList.uploadCatImage, mockInternalServerError)],
    },
  },
};
