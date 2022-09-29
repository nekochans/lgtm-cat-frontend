import type { ComponentStoryObj, Meta } from '@storybook/react';
import { InternalServerErrorImage } from '.';

export default {
  title: 'src/components/ErrorCatImages/InternalServerErrorImage.tsx',
  component: InternalServerErrorImage,
} as Meta<typeof InternalServerErrorImage>;

type Story = ComponentStoryObj<typeof InternalServerErrorImage>;

export const Default: Story = {};
