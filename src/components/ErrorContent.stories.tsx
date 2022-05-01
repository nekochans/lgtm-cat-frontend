import ErrorContent from './ErrorContent';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/ErrorContent.tsx',
  component: ErrorContent,
} as Meta<typeof ErrorContent>;

type Story = ComponentStoryObj<typeof ErrorContent>;

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
