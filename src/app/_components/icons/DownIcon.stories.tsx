import type { Meta, StoryObj } from '@storybook/react';
import { DownIcon } from './DownIcon';

const meta = {
  component: DownIcon,
} satisfies Meta<typeof DownIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
