/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createSuccessResult,
  type AcceptedTypesImageExtension,
  type ImageUploader,
  type ImageValidator,
} from '@/features';
import { sleep } from '@/utils';
import type { Meta, StoryObj } from '@storybook/react';
import { UploadForm } from '.';

const meta: Meta<typeof UploadForm> = {
  component: UploadForm,
  argTypes: {
    uploadCallback: { action: 'uploadCallback executed' },
    onClickCreatedLgtmImage: { action: 'CreatedLgtmImage Clicked' },
    onClickMarkdownSourceCopyButton: {
      action: 'MarkdownSourceCopyButton Clicked',
    },
  },
};

export default meta;

type Story = StoryObj<typeof UploadForm>;

const imageValidator: ImageValidator = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  return createSuccessResult({
    isAcceptableCatImage: true,
    notAcceptableReason: [],
  });
};

const returnFalseImageValidator: ImageValidator = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  return createSuccessResult({
    isAcceptableCatImage: false,
    notAcceptableReason: [
      "Sorry, please use images that do not show people's faces.",
    ],
  });
};

const throwErrorImageValidator: ImageValidator = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  throw new Error('throwErrorImageValidator');
};

const imageUploader: ImageUploader = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  return createSuccessResult({
    createdLgtmImageUrl:
      'https://lgtm-images.lgtmeow.com/2022/06/22/11/56ddad8e-08ea-4d28-bd25-7ba11c4ebdc5.webp' as const,
    displayErrorMessages: [],
  });
};

const imageUploaderWithErrors: ImageUploader = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  return createSuccessResult({
    displayErrorMessages: [
      'Sorry, but please use images that clearly show the cat.',
    ],
  });
};

const throwErrorImageUploader: ImageUploader = async (
  image: string,
  imageExtension: AcceptedTypesImageExtension,
) => {
  await sleep();

  throw new Error('throwErrorImageUploader');
};

export const ViewInJapanese: Story = {
  args: {
    language: 'ja',
    imageValidator,
    imageUploader,
  },
};

export const ViewInJapaneseWithReturnFalseImageValidator: Story = {
  args: {
    language: 'ja',
    imageValidator: returnFalseImageValidator,
    imageUploader,
  },
};

export const ViewInJapaneseWithImageUploaderWithErrors: Story = {
  args: {
    language: 'ja',
    imageValidator,
    imageUploader: imageUploaderWithErrors,
  },
};

export const ViewInJapaneseWithThrowErrorImageValidator: Story = {
  args: {
    language: 'ja',
    imageValidator: throwErrorImageValidator,
    imageUploader,
  },
};

export const ViewInJapaneseWithThrowErrorImageUploader: Story = {
  args: {
    language: 'ja',
    imageValidator,
    imageUploader: throwErrorImageUploader,
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
    imageValidator,
    imageUploader,
  },
};

export const ViewInEnglishWithReturnFalseImageValidator: Story = {
  args: {
    language: 'en',
    imageValidator: returnFalseImageValidator,
    imageUploader,
  },
};

export const ViewInEnglishWithImageUploaderWithErrors: Story = {
  args: {
    language: 'en',
    imageValidator,
    imageUploader: imageUploaderWithErrors,
  },
};

export const ViewInEnglishWithThrowErrorImageValidator: Story = {
  args: {
    language: 'en',
    imageValidator: throwErrorImageValidator,
    imageUploader,
  },
};

export const ViewInEnglishWithThrowErrorImageUploader: Story = {
  args: {
    language: 'en',
    imageValidator,
    imageUploader: throwErrorImageUploader,
  },
};
