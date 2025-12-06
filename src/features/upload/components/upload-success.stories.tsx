// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { UploadSuccess } from "./upload-success";

const meta = {
  component: UploadSuccess,
  title: "features/upload/UploadSuccess",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (StoryComponent) => (
      <div className="w-[700px] rounded-2xl border-[5px] border-primary border-dashed bg-white p-7">
        <StoryComponent />
      </div>
    ),
  ],
  args: {
    onClose: () => {
      // Storybook用のダミー関数
    },
  },
} satisfies Meta<typeof UploadSuccess>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    imageUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM+Cat",
  },
};

export const English: Story = {
  args: {
    language: "en",
    imageUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM+Cat",
  },
};
