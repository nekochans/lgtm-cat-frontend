// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./footer";

const meta = {
  component: Footer,
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ShowJapanese: Story = {
  args: {
    language: "ja",
  },
};

export const ShowEnglish: Story = {
  args: {
    language: "en",
  },
};
