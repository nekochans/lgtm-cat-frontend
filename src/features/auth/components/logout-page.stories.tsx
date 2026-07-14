import type { Meta, StoryObj } from "@storybook/react";
import { LogoutPage } from "./logout-page";

const mockLogoutAction = async (): Promise<void> => {
  await Promise.resolve();
};

/**
 * エラー表示 Story 用のモック。自動実行時の catch に入り、
 * エラーメッセージと再試行ボタンが表示される。
 */
const mockFailingLogoutAction = async (): Promise<void> => {
  await Promise.reject(new Error("mock sign out failure"));
};

const meta = {
  component: LogoutPage,
  title: "features/auth/LogoutPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LogoutPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    logoutAction: mockLogoutAction,
  },
};

export const English: Story = {
  args: {
    language: "en",
    logoutAction: mockLogoutAction,
  },
};

export const ErrorJapanese: Story = {
  args: {
    language: "ja",
    logoutAction: mockFailingLogoutAction,
  },
};

export const ErrorEnglish: Story = {
  args: {
    language: "en",
    logoutAction: mockFailingLogoutAction,
  },
};
