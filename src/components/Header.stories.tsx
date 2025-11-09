// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";

const meta = {
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: false,
  },
};

export const HeaderInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: false,
  },
};

export const LoggedInHeaderInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: true,
  },
};

export const LoggedInHeaderInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: true,
  },
};
