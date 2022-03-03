import MarkdownContents from './MarkdownContents';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/MarkdownContents.tsx',
  component: MarkdownContents,
} as Meta<typeof MarkdownContents>;

type Story = ComponentStoryObj<typeof MarkdownContents>;

const props = {
  markdown: `
  # 🐱ねこの種類🐱
  - 🐈 マンチカン
  - 😺 スコティッシュ・フォールド
  - 😻 チンチラシルバー
  - 🐈‍⬛ ロシアンブルー
  `,
};

export const Default: Story = {
  args: props,
};
