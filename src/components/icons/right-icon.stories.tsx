import type { Meta, StoryObj } from "@storybook/react";
import { RightIcon } from "./right-icon";

const meta = {
  component: RightIcon,
} satisfies Meta<typeof RightIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
