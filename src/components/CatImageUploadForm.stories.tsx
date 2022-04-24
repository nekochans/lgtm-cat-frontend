import { rest } from 'msw';

import {
  apiList,
  appBaseUrl,
  isAcceptableCatImageUrl,
  uploadCatImageUrl,
} from '../constants/url';
import { UploadCatImage } from '../domain/repositories/imageRepository';
import { createSuccessResult } from '../domain/repositories/repositoryResult';
import { UploadedImage } from '../domain/types/lgtmImage';
import { uploadCatImage } from '../infrastructures/repositories/api/fetch/imageRepository';
import sleep from '../infrastructures/utils/sleep';
import mockInternalServerError from '../mocks/api/error/mockInternalServerError';
import mockTokenEndpoint from '../mocks/api/external/cognito/mockTokenEndpoint';
import mockIsAcceptableCatImage from '../mocks/api/external/recognition/mockIsAcceptableCatImage';
import mockIsAcceptableCatImageError from '../mocks/api/external/recognition/mockIsAcceptableCatImageError';
import mockIsAcceptableCatImageNotAllowedImageExtension from '../mocks/api/external/recognition/mockIsAcceptableCatImageNotAllowedImageExtension';
import mockIsAcceptableCatImageNotCatImage from '../mocks/api/external/recognition/mockIsAcceptableCatImageNotCatImage';
import mockIsAcceptableCatImageNotModerationImage from '../mocks/api/external/recognition/mockIsAcceptableCatImageNotModerationImage';
import mockIsAcceptableCatImagePersonFaceInImage from '../mocks/api/external/recognition/mockIsAcceptableCatImagePersonFaceInImage';
import mockUploadCatImage from '../mocks/api/lgtm/images/mockUploadCatImage';
import mockUploadCatImageAuthError from '../mocks/api/lgtm/images/mockUploadCatImageAuthError';
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
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        rest.post(uploadCatImageUrl(), mockUploadCatImage),
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
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
      ],
    },
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
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        rest.post(uploadCatImageUrl(), mockUploadCatImageAuthError),
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
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        rest.post(uploadCatImageUrl(), mockUploadCatImagePayloadTooLarge),
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
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        rest.post(uploadCatImageUrl(), mockUploadCatImageUnprocessableEntity),
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
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        rest.post(uploadCatImageUrl(), mockInternalServerError),
      ],
    },
  },
};

export const UploadingWillResultInNotAllowedImageExtensionError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotAllowedImageExtension,
        ),
      ],
    },
  },
};

export const UploadingWillResultInNotModerationImageError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotModerationImage,
        ),
      ],
    },
  },
};

export const UploadingWillResultInPersonFaceInImageError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImagePersonFaceInImage,
        ),
      ],
    },
  },
};

export const UploadingWillResultInNotCatImageError: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotCatImage,
        ),
      ],
    },
  },
};

export const UploadingWillResultInAnErrorHasOccurred: Story = {
  args: {
    uploadCatImage,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(
          `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
          mockTokenEndpoint,
        ),
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImageError),
      ],
    },
  },
};
