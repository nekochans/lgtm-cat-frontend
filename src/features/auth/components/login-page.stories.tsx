import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./login-page";

/**
 * Storybook 用のモック signinAction。
 * 自動開始 Story ではマウント時にこの関数が呼ばれるが、リダイレクトは発生しない。
 */
const mockSigninAction = async (): Promise<void> => {
  await Promise.resolve();
};

const meta = {
  component: LoginPage,
  title: "features/auth/LoginPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    hasError: false,
    language: "ja",
    signinAction: mockSigninAction,
  },
};

export const English: Story = {
  args: {
    hasError: false,
    language: "en",
    signinAction: mockSigninAction,
  },
};

export const ErrorJapanese: Story = {
  args: {
    hasError: true,
    language: "ja",
    signinAction: mockSigninAction,
  },
};

export const ErrorEnglish: Story = {
  args: {
    hasError: true,
    language: "en",
    signinAction: mockSigninAction,
  },
};
