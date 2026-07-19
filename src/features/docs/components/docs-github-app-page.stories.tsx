import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@/components/header";
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
    header: (
      <Header
        currentUrlPath="/docs/github-app"
        isLoggedIn={false}
        language="ja"
      />
    ),
    language: "ja",
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
    header: (
      <Header
        currentUrlPath="/en/docs/github-app"
        isLoggedIn={false}
        language="en"
      />
    ),
    language: "en",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/github-app",
      },
    },
  },
};
