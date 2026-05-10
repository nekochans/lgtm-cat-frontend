import type { Meta, StoryObj } from "@storybook/react";
import { ComingSoonContent } from "./coming-soon-content";

const meta = {
  component: ComingSoonContent,
  title: "Components/ComingSoonContent",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComingSoonContent>;

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
