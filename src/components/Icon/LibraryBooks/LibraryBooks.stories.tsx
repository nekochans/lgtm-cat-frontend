import type { Meta, StoryObj } from '@storybook/react';
import { LibraryBooks } from './';

const meta = {
  component: LibraryBooks,
} satisfies Meta<typeof LibraryBooks>;

export default meta;

type Story = StoryObj<typeof LibraryBooks>;

export const Default: Story = {
  args: { text: '利用規約' },
};
