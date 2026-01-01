// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { RunningCat } from "./running-cat";

const meta: Meta<typeof RunningCat> = {
  component: RunningCat,
  title: "Components/Cats/RunningCat",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
    },
  },
  argTypes: {
    width: {
      control: { type: "number" },
      description: "Width of the SVG",
    },
    height: {
      control: { type: "number" },
      description: "Height of the SVG",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RunningCat>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    width: 185,
    height: 169,
  },
};

export const Large: Story = {
  args: {
    width: 740,
    height: 678,
  },
};
