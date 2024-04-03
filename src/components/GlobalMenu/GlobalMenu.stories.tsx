import type { Meta, StoryObj } from '@storybook/react';
import { GlobalMenu } from './';

const meta = {
  component: GlobalMenu,
} satisfies Meta<typeof GlobalMenu>;

export default meta;

type Story = StoryObj<typeof GlobalMenu>;

export const ViewInJapanese: Story = {
  args: { language: 'ja' },
};

export const ViewInEnglish: Story = {
  args: { language: 'en' },
};
