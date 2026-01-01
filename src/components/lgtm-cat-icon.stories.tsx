// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmCatIcon } from "./lgtm-cat-icon";

const meta = {
  component: LgtmCatIcon,
} satisfies Meta<typeof LgtmCatIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
