import { CalmCatImage } from '@/components';
import { isAcceptableCatImageUrl, uploadCatImageUrl } from '@/features';
import { mockIsAcceptableCatImage, mockUploadCatImage } from '@/mocks';
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
    children: <CalmCatImage />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        http.post(uploadCatImageUrl(), mockUploadCatImage),
      ],
    },
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
    children: <CalmCatImage />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        http.post(uploadCatImageUrl(), mockUploadCatImage),
      ],
    },
  },
};
