// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderMobile } from "@/components/header-mobile";

const meta = {
  component: HeaderMobile,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
} satisfies Meta<typeof HeaderMobile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderMobileInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: false,
  },
};

export const HeaderMobileInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: false,
  },
};

export const LoggedInHeaderMobileInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: true,
  },
};

export const LoggedInHeaderMobileInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: true,
  },
};
