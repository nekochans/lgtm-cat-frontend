import type { Meta, StoryObj } from '@storybook/react';
import { InternalServerErrorImage } from '.';

const meta = {
  component: InternalServerErrorImage,
} satisfies Meta<typeof InternalServerErrorImage>;

export default meta;

type Story = StoryObj<typeof InternalServerErrorImage>;

export const Default: Story = {};
