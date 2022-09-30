import type { ComponentStoryObj } from '@storybook/react';
import { NotFoundImage } from '.';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  component: NotFoundImage,
};

type Story = ComponentStoryObj<typeof NotFoundImage>;

export const Default: Story = {};
