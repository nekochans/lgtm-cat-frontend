import type { Meta, StoryObj } from '@storybook/react';
import { RetryButton } from './RetryButton';

const meta: Meta<typeof RetryButton> = {
  component: RetryButton,
  argTypes: {
    onClick: { action: 'RetryButton clicked!' }
  },
};

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
