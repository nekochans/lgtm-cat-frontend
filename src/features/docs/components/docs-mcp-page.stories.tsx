// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsMcpPage } from "./docs-mcp-page";

const meta = {
  component: DocsMcpPage,
  title: "features/docs/DocsMcpPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsMcpPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版MCPドキュメントページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/mcp",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/mcp",
      },
    },
  },
};

/**
 * 英語版MCPドキュメントページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/mcp",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/mcp",
      },
    },
  },
};
