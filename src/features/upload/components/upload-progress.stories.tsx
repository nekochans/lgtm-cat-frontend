// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { UploadProgress } from "./upload-progress";

const meta = {
  component: UploadProgress,
  title: "features/upload/UploadProgress",
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
} satisfies Meta<typeof UploadProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 50,
  },
};

export const English: Story = {
  args: {
    language: "en",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 50,
  },
};

export const Progress0: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 0,
  },
};

export const Progress100: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 100,
  },
};
