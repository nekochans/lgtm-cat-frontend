// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { GlobeIcon } from "./globe-icon";

const meta = {
  component: GlobeIcon,
} satisfies Meta<typeof GlobeIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
