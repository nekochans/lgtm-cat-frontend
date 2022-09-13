import { NotFoundImage } from '.';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/ErrorCatImages/NotFoundImage.tsx',
  component: NotFoundImage,
} as Meta<typeof NotFoundImage>;

type Story = ComponentStoryObj<typeof NotFoundImage>;

export const Default: Story = {};
