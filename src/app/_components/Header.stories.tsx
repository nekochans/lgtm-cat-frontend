import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta = {
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderInJapanese: Story = {
  args: {
    language: 'ja',
  },
};

export const HeaderInEnglish: Story = {
  args: {
    language: 'en',
  },
};
