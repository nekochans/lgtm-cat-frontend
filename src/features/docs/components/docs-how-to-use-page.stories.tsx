// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsHowToUsePage } from "./docs-how-to-use-page";

const meta = {
  component: DocsHowToUsePage,
  title: "features/docs/DocsHowToUsePage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsHowToUsePage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版使い方ページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/how-to-use",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/how-to-use",
      },
    },
  },
};

/**
 * 英語版使い方ページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/how-to-use",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/how-to-use",
      },
    },
  },
};
