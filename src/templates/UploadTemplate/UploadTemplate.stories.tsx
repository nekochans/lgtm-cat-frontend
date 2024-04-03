import { CalmCatImage, Footer } from '@/components';
import { isAcceptableCatImageUrl, uploadCatImageUrl } from '@/features';
import { mockIsAcceptableCatImage, mockUploadCatImage } from '@/mocks';
import type { Meta, StoryObj } from '@storybook/react';
import { http } from 'msw';
import { UploadTemplate } from '.';

const meta = {
  component: UploadTemplate,
} satisfies Meta<typeof UploadTemplate>;

export default meta;

type Story = StoryObj<typeof UploadTemplate>;

const languageJa = 'ja';

const languageEn = 'en';

export const ViewInJapanese: Story = {
  args: {
    language: languageJa,
    children: <CalmCatImage />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageJa} />
      </>
    ),
  ],
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
    language: languageEn,
    children: <CalmCatImage />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageEn} />
      </>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
        http.post(uploadCatImageUrl(), mockUploadCatImage),
      ],
    },
  },
};
