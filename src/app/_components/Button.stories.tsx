import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'button',
    displayText: 'Button',
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
