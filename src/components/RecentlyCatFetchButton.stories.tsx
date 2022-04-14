import RecentlyCatFetchButton from './RecentlyCatFetchButton';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/RecentlyCatFetchButton.tsx',
  component: RecentlyCatFetchButton,
} as Meta<typeof RecentlyCatFetchButton>;

type Story = ComponentStoryObj<typeof RecentlyCatFetchButton>;

const props = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleOnClick: (): void => {},
};

export const Default: Story = {
  args: props,
};
