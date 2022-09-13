import { MarkdownContents } from './.';

import type { ComponentStoryObj, Meta } from '@storybook/react';

export default {
  title: 'src/components/MarkdownContents/MarkdownContents.tsx',
  component: MarkdownContents,
} as Meta<typeof MarkdownContents>;

type Story = ComponentStoryObj<typeof MarkdownContents>;

const markdown = `
  # 🐱ねこの種類🐱
  - 🐈 マンチカン
  - 😺 スコティッシュ・フォールド
  - 😻 チンチラシルバー
  - 🐈‍⬛ ロシアンブルー
  # 🐱ねこの好きな物🐱
  - ちゅーる
  - マタタビ
  - お昼寝
`;

export const Default: Story = {
  args: { markdown },
};
