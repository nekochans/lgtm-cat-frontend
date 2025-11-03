import type { Meta, StoryObj } from "@storybook/react";
import { LoginButton } from "./LoginButton";

const meta = {
  component: LoginButton,
} satisfies Meta<typeof LoginButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginButtonInJapanese: Story = {
  args: {
    language: "ja",
  },
};

export const LoginButtonInEnglish: Story = {
  args: {
    language: "en",
  },
};
