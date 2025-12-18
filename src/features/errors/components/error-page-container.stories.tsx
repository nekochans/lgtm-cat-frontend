// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { ErrorPageContainer } from "./error-page-container";

const mockError = new Error("Test error for Storybook");

const meta = {
  component: ErrorPageContainer,
  title: "features/errors/ErrorPageContainer",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    error: mockError,
    reset: () => {
      // eslint-disable-next-line no-console
      console.log("Reset function called");
    },
  },
} satisfies Meta<typeof ErrorPageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

export const English: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en",
      },
    },
  },
};
