// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { RightIcon } from "./right-icon";

const meta = {
  component: RightIcon,
} satisfies Meta<typeof RightIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
