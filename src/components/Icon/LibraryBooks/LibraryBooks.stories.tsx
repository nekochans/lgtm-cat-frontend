import type { Meta, StoryObj } from '@storybook/react';
import { LibraryBooks } from './';

const meta: Meta<typeof LibraryBooks> = {
  component: LibraryBooks,
};

export default meta;

type Story = StoryObj<typeof LibraryBooks>;

export const Default: Story = {
  args: { text: '利用規約' },
};
