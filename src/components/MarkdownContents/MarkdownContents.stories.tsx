import type { ComponentStoryObj } from '@storybook/react';
import { MarkdownContents } from './.';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  component: MarkdownContents,
};

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
