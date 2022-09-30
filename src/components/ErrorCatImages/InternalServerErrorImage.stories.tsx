import type { ComponentStoryObj } from '@storybook/react';
import { InternalServerErrorImage } from '.';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  component: InternalServerErrorImage,
};

type Story = ComponentStoryObj<typeof InternalServerErrorImage>;

export const Default: Story = {};
