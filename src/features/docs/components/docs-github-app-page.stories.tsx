// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsGitHubAppPage } from "./docs-github-app-page";

const meta = {
  component: DocsGitHubAppPage,
  title: "features/docs/DocsGitHubAppPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsGitHubAppPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版GitHub Appドキュメントページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/github-app",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/github-app",
      },
    },
  },
};

/**
 * 英語版GitHub Appドキュメントページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/github-app",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/github-app",
      },
    },
  },
};
