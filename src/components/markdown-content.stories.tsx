// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownContent } from "@/components/markdown-content";

const sampleMarkdown = `# 利用規約

この利用規約は、サービスの利用条件を定めるものです。

## 第1条（適用）

本規約は，ユーザーと運営チームとの間の本サービスの利用に関わる一切の関係に適用されるものとします。

## 第2条（利用登録）

登録希望者が運営チームの定める方法によって利用登録を申請し，運営チームがこれを承認することによって，利用登録が完了するものとします。

1. 利用登録の申請に際して虚偽の事項を届け出た場合
1. 本規約に違反したことがある者からの申請である場合
1. その他，運営チームが利用登録を相当でないと判断した場合

詳しくは[GitHub](https://github.com)をご覧ください。
`;

const meta = {
  component: MarkdownContent,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (StoryComponent) => (
      <div className="max-w-[940px] bg-background p-10">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: sampleMarkdown,
  },
};
