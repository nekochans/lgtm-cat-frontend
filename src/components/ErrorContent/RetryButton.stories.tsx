import type { Meta, StoryObj } from '@storybook/react';
import { RetryButton } from './RetryButton';

const meta = {
  component: RetryButton,
  argTypes: {
    onClick: { action: 'RetryButton clicked!' },
  },
} satisfies Meta<typeof RetryButton>;

export default meta;

type Story = StoryObj<typeof RetryButton>;

export const ViewInJapanese: Story = {
  args: {
    language: 'ja',
  },
};

export const ViewInEnglish: Story = {
  args: {
    language: 'en',
  },
};
