import type { Meta, StoryObj } from '@storybook/react';
import { GitHubLoginButton } from './GitHubLoginButton';

const meta = {
  component: GitHubLoginButton,
} satisfies Meta<typeof GitHubLoginButton>;

export default meta;

type Story = StoryObj<typeof GitHubLoginButton>;

export const Default: Story = {};
