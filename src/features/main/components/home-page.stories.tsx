// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";
import { HomePage } from "./home-page";

/**
 * モックLGTM画像データを生成
 */
const mockImages = fetchLgtmImagesMockBody.lgtmImages.map((image) => ({
  id: createLgtmImageId(Number(image.id)),
  imageUrl: createLgtmImageUrl(image.url),
}));

/**
 * Storybookで使用するモックLGTM画像コンポーネント
 */
const MockLgtmImages = () => (
  <LgtmImages hideHeartIcon={true} images={mockImages} />
);

const meta = {
  component: HomePage,
  title: "features/main/HomePage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版ホームページ (ランダム表示)
 */
export const JapaneseRandom: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImages: <MockLgtmImages />,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

/**
 * 日本語版ホームページ (最新表示)
 */
export const JapaneseLatest: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "latest",
    lgtmImages: <MockLgtmImages />,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

/**
 * 英語版ホームページ (ランダム表示)
 */
export const EnglishRandom: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    view: "random",
    lgtmImages: <MockLgtmImages />,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en",
      },
    },
  },
};

/**
 * 英語版ホームページ (最新表示)
 */
export const EnglishLatest: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    view: "latest",
    lgtmImages: <MockLgtmImages />,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en",
      },
    },
  },
};

/**
 * 画像が少ない場合の表示確認
 */
export const FewImages: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImages: (
      <LgtmImages hideHeartIcon={true} images={mockImages.slice(0, 3)} />
    ),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
    docs: {
      description: {
        story:
          "LGTM画像が3枚のみの場合のレイアウト確認用。グリッドレイアウトの表示崩れがないか検証できます。",
      },
    },
  },
};

/**
 * 画像がない場合の表示確認
 */
export const EmptyImages: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImages: <LgtmImages hideHeartIcon={true} images={[]} />,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
    docs: {
      description: {
        story:
          "LGTM画像が0枚の場合の表示確認用。APIエラー時や初期状態でのUIを検証できます。",
      },
    },
  },
};
