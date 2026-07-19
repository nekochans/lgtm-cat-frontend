import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@/components/header";
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
    header: (
      <Header currentUrlPath="/favorites" isLoggedIn={true} language="ja" />
    ),
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
    header: (
      <Header currentUrlPath="/en/favorites" isLoggedIn={true} language="en" />
    ),
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
