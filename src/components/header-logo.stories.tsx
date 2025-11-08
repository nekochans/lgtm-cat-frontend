// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderLogo } from "./header-logo";

const meta = {
  component: HeaderLogo,
} satisfies Meta<typeof HeaderLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HomeLinkIsJapanese: Story = {
  args: {
    language: "ja",
  },
};

export const HomeLinkIsEnglish: Story = {
  args: {
    language: "en",
  },
};
