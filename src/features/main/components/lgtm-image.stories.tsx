// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImage } from "@/features/main/components/lgtm-image";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtmImage";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";

const meta = {
  component: LgtmImage,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (StoryComponent) => (
      <div className="w-[400px]">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof LgtmImage>;

export default meta;

type Story = StoryObj<typeof meta>;

const [firstImage, secondImage] = fetchLgtmImagesMockBody.lgtmImages;

export const Default: Story = {
  args: {
    id: createLgtmImageId(Number(firstImage.id)),
    imageUrl: createLgtmImageUrl(firstImage.url),
  },
};

export const AnotherImage: Story = {
  args: {
    id: createLgtmImageId(Number(secondImage.id)),
    imageUrl: createLgtmImageUrl(secondImage.url),
  },
};
