import type { Meta, StoryObj } from '@storybook/react';
import { ServiceUnavailableImage } from '.';

const meta = {
  component: ServiceUnavailableImage,
} satisfies Meta<typeof ServiceUnavailableImage>;

export default meta;

type Story = StoryObj<typeof ServiceUnavailableImage>;

export const Default: Story = {};
