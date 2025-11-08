// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { GithubIcon } from "./github-icon";

const meta = {
  component: GithubIcon,
} satisfies Meta<typeof GithubIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 20,
    height: 20,
    color: "default",
  },
};

export const White: Story = {
  args: {
    width: 20,
    height: 20,
    color: "white",
  },
};
