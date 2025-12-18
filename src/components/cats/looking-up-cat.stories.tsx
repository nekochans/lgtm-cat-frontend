// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LookingUpCat } from "./looking-up-cat";

const meta: Meta<typeof LookingUpCat> = {
  component: LookingUpCat,
  title: "Components/Cats/LookingUpCat",
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
type Story = StoryObj<typeof LookingUpCat>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    width: 122,
    height: 187,
  },
};

export const Large: Story = {
  args: {
    width: 490,
    height: 750,
  },
};
