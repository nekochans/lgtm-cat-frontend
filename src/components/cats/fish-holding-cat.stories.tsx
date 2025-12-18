// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { FishHoldingCat } from "./fish-holding-cat";

const meta: Meta<typeof FishHoldingCat> = {
  component: FishHoldingCat,
  title: "Components/Cats/FishHoldingCat",
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
type Story = StoryObj<typeof FishHoldingCat>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    width: 175,
    height: 167,
  },
};

export const Large: Story = {
  args: {
    width: 700,
    height: 670,
  },
};
