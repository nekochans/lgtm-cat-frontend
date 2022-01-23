import Error from './Error';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/Error.tsx',
  component: Error,
} as Meta<typeof Error>;

type Story = ComponentStoryObj<typeof Error>;

const style = {
  color: 'royalblue',
};

const props = {
  title: 'Error',
  message:
    'エラーが発生しました。お手数ですが、時間がたってから再度お試し下さい。',
  topLink: (
    <a href="https://policies.google.com" style={style}>
      TOPページへ
    </a>
  ),
};

export const Default: Story = {
  args: props,
};
