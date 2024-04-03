import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownPageTitle } from './';

const meta = {
  component: MarkdownPageTitle,
} satisfies Meta<typeof MarkdownPageTitle>;

export default meta;

type Story = StoryObj<typeof MarkdownPageTitle>;

export const Default: Story = {
  args: { text: '利用規約' },
};
