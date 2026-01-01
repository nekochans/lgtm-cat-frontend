// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundPage } from "./not-found-page";

const meta = {
  component: NotFoundPage,
  title: "features/errors/NotFoundPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
};
