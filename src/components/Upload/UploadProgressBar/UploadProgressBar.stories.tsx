import type { Meta, StoryObj } from '@storybook/react';
import { UploadProgressBar } from '.';

const meta: Meta<typeof UploadProgressBar> = {
  component: UploadProgressBar,
};

export default meta;

type Story = StoryObj<typeof UploadProgressBar>;

export const ViewInJapanese: Story = {
  args: { language: 'ja' },
};

export const ViewInEnglish: Story = {
  args: { language: 'en' },
};
