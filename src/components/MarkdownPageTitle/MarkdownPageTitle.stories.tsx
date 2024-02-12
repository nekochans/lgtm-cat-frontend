import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownPageTitle } from './';

const meta: Meta<typeof MarkdownPageTitle> = {
  component: MarkdownPageTitle,
};

export default meta;

type Story = StoryObj<typeof MarkdownPageTitle>;

export const Default: Story = {
  args: { text: '利用規約' },
};
