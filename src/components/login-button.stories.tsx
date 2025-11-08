// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LoginButton } from "./login-button";

const meta = {
  component: LoginButton,
} satisfies Meta<typeof LoginButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginButtonInJapanese: Story = {
  args: {
    language: "ja",
  },
};

export const LoginButtonInEnglish: Story = {
  args: {
    language: "en",
  },
};
