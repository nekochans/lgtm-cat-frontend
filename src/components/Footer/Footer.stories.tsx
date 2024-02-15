import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './';

const meta: Meta<typeof Footer> = {
  component: Footer,
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const ViewInJapanese: Story = {
  args: { language: 'ja' },
};

export const ViewInEnglish: Story = {
  args: { language: 'en' },
};
