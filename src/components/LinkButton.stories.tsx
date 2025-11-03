import type { Meta, StoryObj } from "@storybook/react";
import { LinkButton } from "./LinkButton";

const meta = {
  component: LinkButton,
} satisfies Meta<typeof LinkButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    linkText: "Go To Home",
    linkUrl: "/",
  },
};

export const WithClassName: Story = {
  args: {
    linkText: "Go To Home",
    linkUrl: "/en",
    className: "bg-green-500",
  },
};

export const WithStyle: Story = {
  args: {
    linkText: "Go To Home",
    linkUrl: "/en",
    style: {
      color: "blue",
    },
  },
};
