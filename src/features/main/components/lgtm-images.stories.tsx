import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";
import { createLgtmImageId, createLgtmImageUrl } from "@/types/lgtm-image";

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

// TODO: ログイン機能、お気に入り機能実装後はこのStoryを削除する
export const HiddenHeartIcon: Story = {
  args: {
    hideHeartIcon: true,
    images: mockImages,
  },
};

export const Empty: Story = {
  args: {
    images: [],
  },
};
