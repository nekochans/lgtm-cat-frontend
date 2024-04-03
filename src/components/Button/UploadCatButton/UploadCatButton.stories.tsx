import type { Meta, StoryObj } from '@storybook/react';
import { UploadCatButton } from './index';

const meta = {
  component: UploadCatButton,
} satisfies Meta<typeof UploadCatButton>;

export default meta;

type Story = StoryObj<typeof UploadCatButton>;

export const Default: Story = {
  args: {
    link: '/upload',
  },
};
