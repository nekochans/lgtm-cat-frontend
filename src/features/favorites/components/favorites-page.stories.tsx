import type { Meta, StoryObj } from "@storybook/react";
import { FavoritesPage } from "./favorites-page";

const meta = {
  component: FavoritesPage,
  title: "features/favorites/FavoritesPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FavoritesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/favorites",
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
        pathname: "/en/favorites",
      },
    },
  },
};
