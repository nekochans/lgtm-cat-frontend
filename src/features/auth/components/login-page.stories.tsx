import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./login-page";

/**
 * Storybook 用のモック loginAction。
 * 自動開始 Story ではマウント時にこの関数が呼ばれるが、リダイレクトは発生しない。
 */
const mockLoginAction = async (): Promise<void> => {
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
    language: "ja",
    loginAction: mockLoginAction,
  },
};

export const English: Story = {
  args: {
    language: "en",
    loginAction: mockLoginAction,
  },
};

export const ErrorJapanese: Story = {
  args: {
    errorCode: "signin_failed",
    language: "ja",
    loginAction: mockLoginAction,
  },
};

export const ErrorEnglish: Story = {
  args: {
    errorCode: "signin_failed",
    language: "en",
    loginAction: mockLoginAction,
  },
};
