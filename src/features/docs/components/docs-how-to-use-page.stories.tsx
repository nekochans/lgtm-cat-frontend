import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@/components/header";
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
    header: (
      <Header
        currentUrlPath="/docs/how-to-use"
        isLoggedIn={false}
        language="ja"
      />
    ),
    language: "ja",
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
    header: (
      <Header
        currentUrlPath="/en/docs/how-to-use"
        isLoggedIn={false}
        language="en"
      />
    ),
    language: "en",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/how-to-use",
      },
    },
  },
};
