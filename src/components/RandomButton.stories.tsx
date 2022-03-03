import RandomButton from './RandomButton';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/RandomButton.tsx',
  component: RandomButton,
} as Meta<typeof RandomButton>;

type Story = ComponentStoryObj<typeof RandomButton>;

const props = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleRandom: (): void => {},
};

export const Default: Story = {
  args: props,
};
