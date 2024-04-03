import type { Meta, StoryObj } from '@storybook/react';
import { CatRandomCopyButton } from '.';

const meta = {
  component: CatRandomCopyButton,
  argTypes: { callback: { action: 'callback' } },
} satisfies Meta<typeof CatRandomCopyButton>;

export default meta;

type Story = StoryObj<typeof CatRandomCopyButton>;

export const Default: Story = {
  args: {
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2022/09/14/11/151f27e7-f9fd-4093-8f87-cd95d9cdadb3.webp',
  },
};
