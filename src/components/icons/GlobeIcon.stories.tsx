import type { Meta, StoryObj } from "@storybook/react";
import { GlobeIcon } from "./GlobeIcon";

const meta = {
  component: GlobeIcon,
} satisfies Meta<typeof GlobeIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
