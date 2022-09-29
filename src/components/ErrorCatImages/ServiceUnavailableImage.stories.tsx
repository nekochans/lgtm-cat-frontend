import type { ComponentStoryObj, Meta } from '@storybook/react';
import { ServiceUnavailableImage } from '.';

export default {
  title: 'src/components/ErrorCatImages/ServiceUnavailableImage.tsx',
  component: ServiceUnavailableImage,
} as Meta<typeof ServiceUnavailableImage>;

type Story = ComponentStoryObj<typeof ServiceUnavailableImage>;

export const Default: Story = {};
