import type { Meta, StoryObj } from "@storybook/react";
import { GithubIcon } from "./GithubIcon";

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
