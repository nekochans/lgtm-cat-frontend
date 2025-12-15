// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderDesktop } from "@/components/header-desktop";

const meta = {
  component: HeaderDesktop,
} satisfies Meta<typeof HeaderDesktop>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderDesktopInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: false,
  },
};

export const HeaderDesktopInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: false,
  },
};

export const LoggedInHeaderDesktopInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: true,
  },
};

export const LoggedInHeaderDesktopInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: true,
  },
};
