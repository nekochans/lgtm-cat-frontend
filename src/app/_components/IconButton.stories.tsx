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
    displayText: 'ログイン',
    showGithubIcon: true,
  },
};

export const WithGithubIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ログイン',
    showGithubIcon: true,
    isPressed: true,
  },
};

export const WithRepeatIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ランダムコピー',
    showRepeatIcon: true,
    style: { width: '240px' },
  },
};

export const WithRepeatIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ランダムコピー',
    showRepeatIcon: true,
    isPressed: true,
    style: { width: '240px' },
  },
};

export const WithRandomIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ねこリフレッシュ',
    showRandomIcon: true,
    style: { width: '240px' },
  },
};

export const WithRandomIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ねこリフレッシュ',
    showRandomIcon: true,
    isPressed: true,
    style: { width: '240px' },
  },
};

export const WithCatIcon: Story = {
  args: {
    type: 'button',
    displayText: 'ねこ新着順',
    showCatIcon: true,
    style: { width: '240px' },
  },
};

export const WithCatIconPressed: Story = {
  args: {
    type: 'button',
    displayText: 'ねこ新着順',
    showCatIcon: true,
    isPressed: true,
    style: { width: '240px' },
  },
};
