import type { Meta, StoryObj } from '@storybook/react';
import { UploadCatButton } from './index';

const meta: Meta<typeof UploadCatButton> = {
  component: UploadCatButton,
};

export default meta;

type Story = StoryObj<typeof UploadCatButton>;

export const Default: Story = {
  args: {
    link: '/upload',
  },
};
