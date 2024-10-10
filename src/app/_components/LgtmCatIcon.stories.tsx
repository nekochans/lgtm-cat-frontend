import type { Meta, StoryObj } from '@storybook/react';
import { LgtmCatIcon } from './LgtmCatIcon';

const meta = {
  component: LgtmCatIcon,
} satisfies Meta<typeof LgtmCatIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
