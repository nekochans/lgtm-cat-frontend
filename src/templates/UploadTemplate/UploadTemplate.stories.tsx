import { uploadCatImageUrl } from '@/features';
import { mockUploadCatImage } from '@/mocks';
import type { Meta, StoryObj } from '@storybook/react';
import { http } from 'msw';
import { UploadTemplate } from '.';

const meta: Meta<typeof UploadTemplate> = {
  component: UploadTemplate,
};

export default meta;

type Story = StoryObj<typeof UploadTemplate>;

export const ViewInJapanese: Story = {
  args: {
    language: 'ja',
  },
  parameters: {
    msw: {
      handlers: [http.post(uploadCatImageUrl(), mockUploadCatImage)],
    },
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
  },
  parameters: {
    msw: {
      handlers: [http.post(uploadCatImageUrl(), mockUploadCatImage)],
    },
  },
};
