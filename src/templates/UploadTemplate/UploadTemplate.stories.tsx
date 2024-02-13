import type { Meta, StoryObj } from '@storybook/react';
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
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
  },
};
