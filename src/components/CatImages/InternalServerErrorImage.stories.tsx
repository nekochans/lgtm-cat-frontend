import type { StoryObj } from '@storybook/react';
import { InternalServerErrorImage } from '.';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  component: InternalServerErrorImage,
};

type Story = StoryObj<typeof InternalServerErrorImage>;

export const Default: Story = {};
