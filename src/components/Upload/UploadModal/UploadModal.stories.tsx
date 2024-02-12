import type { Meta, StoryObj } from '@storybook/react';
import { UploadModal } from './';

const meta: Meta<typeof UploadModal> = {
  component: UploadModal,
};

export default meta;

type Story = StoryObj<typeof UploadModal>;

export const ViewInJapanese: Story = {
  args: {
    isOpen: true,
    language: 'ja',
    imagePreviewUrl:
      'https://user-images.githubusercontent.com/11032365/168945770-df68010f-69cd-40cd-86bc-f8e1c0184589.png',
  },
};

export const ViewInEnglish: Story = {
  args: {
    isOpen: true,
    language: 'en',
    imagePreviewUrl:
      'https://user-images.githubusercontent.com/11032365/179384698-2dc862cb-f74c-47f3-9949-aee4572852d4.jpeg',
  },
};

export const ViewInJapaneseUploadSuccessful: Story = {
  args: {
    isOpen: true,
    language: 'ja',
    imagePreviewUrl:
      'https://user-images.githubusercontent.com/11032365/168945770-df68010f-69cd-40cd-86bc-f8e1c0184589.png',
    uploaded: true,
    createdLgtmImageUrl:
      'https://user-images.githubusercontent.com/11032365/168945770-df68010f-69cd-40cd-86bc-f8e1c0184589.png',
  },
};

export const ViewInEnglishUploadSuccessful: Story = {
  args: {
    isOpen: true,
    language: 'en',
    imagePreviewUrl:
      'https://user-images.githubusercontent.com/11032365/179384698-2dc862cb-f74c-47f3-9949-aee4572852d4.jpeg',
    uploaded: true,
    createdLgtmImageUrl:
      'https://user-images.githubusercontent.com/11032365/179384698-2dc862cb-f74c-47f3-9949-aee4572852d4.jpeg',
  },
};
