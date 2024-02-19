import type { Meta, StoryObj } from '@storybook/react';
import { CatButtonGroup } from './';

const meta: Meta<typeof CatButtonGroup> = {
  component: CatButtonGroup,
  argTypes: {
    onClickFetchRandomCatButton: { action: 'FetchRandomCatButton Clicked' },
    onClickFetchNewArrivalCatButton: {
      action: 'FetchNewArrivalCatButton Clicked',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CatButtonGroup>;

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
