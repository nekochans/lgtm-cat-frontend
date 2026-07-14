import type { Meta, StoryObj } from "@storybook/react";
import { LoginButton } from "./login-button";

const meta = {
  component: LoginButton,
} satisfies Meta<typeof LoginButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginButtonInJapanese: Story = {
  args: {
    currentUrlPath: "/upload",
    language: "ja",
  },
};

export const LoginButtonInEnglish: Story = {
  args: {
    currentUrlPath: "/en/upload",
    language: "en",
  },
};
