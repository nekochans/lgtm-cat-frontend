// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";

const meta = {
  component: LgtmImages,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof LgtmImages>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockImages = fetchLgtmImagesMockBody.lgtmImages.map((image) => ({
  id: createLgtmImageId(Number(image.id)),
  imageUrl: createLgtmImageUrl(image.url),
}));

export const Default: Story = {
  args: {
    images: mockImages,
  },
};

export const FewImages: Story = {
  args: {
    images: mockImages.slice(0, 3),
  },
};

export const Empty: Story = {
  args: {
    images: [],
  },
};
