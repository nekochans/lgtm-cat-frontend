import type { Meta, StoryObj } from "@storybook/react";
import { MyCatsPage } from "./my-cats-page";

const meta = {
  component: MyCatsPage,
  title: "features/my-cats/MyCatsPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MyCatsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/my-cats",
      },
    },
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/my-cats",
      },
    },
  },
};
