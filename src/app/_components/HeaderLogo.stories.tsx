import type { Meta, StoryObj } from '@storybook/react';
import { HeaderLogo } from './HeaderLogo';

const meta = {
  component: HeaderLogo,
} satisfies Meta<typeof HeaderLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
