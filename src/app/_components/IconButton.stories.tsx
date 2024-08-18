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
    isPressed: true,
  },
};

export const WithRepeatIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ランダムコピー',
    showRepeatIcon: true,
  },
};

export const WithRepeatIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ランダムコピー',
    showRepeatIcon: true,
    isPressed: true,
  },
};

export const WithRandomIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ねこリフレッシュ',
    showRandomIcon: true,
  },
};

export const WithRandomIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ねこリフレッシュ',
    showRandomIcon: true,
    isPressed: true,
  },
};

export const WithCatIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ねこ新着順',
    showCatIcon: true,
  },
};

export const WithCatIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ねこ新着順',
    showCatIcon: true,
    isPressed: true,
  },
};
