import type { ComponentStoryObj, Meta } from '@storybook/react';
import { NotFoundImage } from '.';

export default {
  title: 'src/components/ErrorCatImages/NotFoundImage.tsx',
  component: NotFoundImage,
} as Meta<typeof NotFoundImage>;

type Story = ComponentStoryObj<typeof NotFoundImage>;

export const Default: Story = {};
