import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta = {
  component: IconButton,
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'button',
    displayText: 'ログイン',
  },
};

export const WithGithubIcon: Story = {
  args: {
    type: 'button',
    displayText: 'Login',
    showGithubIcon: true,
  },
};

export const WithGithubIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'Login',
    showGithubIcon: true,
    isPending: true,
  },
};
