// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { expect, userEvent, within } from "storybook/test";

import { Page } from "./page";

const LOGIN_BUTTON_LABEL = /Log in/i;
const LOGOUT_BUTTON_LABEL = /Log out/i;

const meta = {
  title: "Example/page",
  component: Page,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole("button", {
      name: LOGIN_BUTTON_LABEL,
    });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButton = canvas.getByRole("button", {
      name: LOGOUT_BUTTON_LABEL,
    });
    await expect(logoutButton).toBeInTheDocument();
  },
};
