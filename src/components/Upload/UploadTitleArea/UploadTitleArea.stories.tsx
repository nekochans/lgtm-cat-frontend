import type { Meta, StoryObj } from '@storybook/react';
import { UploadTitleArea } from './index';

const meta: Meta<typeof UploadTitleArea> = {
  component: UploadTitleArea,
};

export default meta;

type Story = StoryObj<typeof UploadTitleArea>;

export const ViewInJapanese: Story = {
  args: { language: 'ja' },
};

export const ViewInEnglish: Story = {
  args: { language: 'en' },
};
