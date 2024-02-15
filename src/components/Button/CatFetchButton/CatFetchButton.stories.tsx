import type { Meta, StoryObj } from '@storybook/react';
import { CatFetchButton } from '.';

const meta: Meta<typeof CatFetchButton> = {
  component: CatFetchButton,
};

export default meta;

type Story = StoryObj<typeof CatFetchButton>;

export const CatsRefreshButton: Story = {
  args: {
    type: 'refresh',
  },
};

export const NewArrivalCatsButton: Story = {
  args: {
    type: 'new',
  },
};
