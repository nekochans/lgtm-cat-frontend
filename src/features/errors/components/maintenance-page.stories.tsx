// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { MaintenancePage } from "./maintenance-page";

const meta = {
  component: MaintenancePage,
  title: "features/errors/MaintenancePage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MaintenancePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
};
