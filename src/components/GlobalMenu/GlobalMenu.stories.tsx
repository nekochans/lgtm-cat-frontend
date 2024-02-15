import type { Meta, StoryObj } from '@storybook/react';
import { GlobalMenu } from './';

const meta: Meta<typeof GlobalMenu> = {
  component: GlobalMenu,
};

export default meta;

type Story = StoryObj<typeof GlobalMenu>;

export const ViewInJapanese: Story = {
  args: { language: 'ja' },
};

export const ViewInEnglish: Story = {
  args: { language: 'en' },
};
