import Button from './Button';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/Button.tsx',
  component: Button,
} as Meta<typeof Button>;

type Story = ComponentStoryObj<typeof Button>;

export const ShowTextIsRandomCatFetchButton: Story = {
  args: {
    text: '他の猫ちゃんを表示',
    onClick: () => {
      // eslint-disable-next-line no-alert
      window.alert('他の猫ちゃんを表示');
    },
  },
};

export const ShowTextIsRecentlyCatFetchButton: Story = {
  args: {
    text: '新着の猫ちゃんを表示',
    onClick: () => {
      // eslint-disable-next-line no-alert
      window.alert('新着の猫ちゃんを表示');
    },
  },
};
