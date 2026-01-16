// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import {
  createImageSizeTooLargeErrorMessage,
  errorMessageNotCatImage,
  errorMessagePersonFaceInImage,
} from "@/features/upload/functions/upload-i18n";
import { UploadPage } from "./upload-page";

/**
 * モック用のダミーファイルを作成
 */
function createDummyFile(name: string, type: string): File {
  const blob = new Blob(["dummy content"], { type });
  return new File([blob], name, { type });
}

/**
 * 成功用のモック関数群を作成
 */
function createSuccessMocks() {
  return {
    generateUploadUrlAction: async () =>
      Promise.resolve({
        success: true as const,
        presignedPutUrl: "https://mock-storage.example.com/upload",
        objectKey: "mock-object-key",
      }),
    uploadToStorage: async () => Promise.resolve({ success: true as const }),
    validateAndCreateLgtmImageAction: async () =>
      Promise.resolve({
        success: true as const,
        createdLgtmImageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/mock-lgtm.webp"
        ),
        previewImageUrl:
          "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
      }),
  };
}

const meta = {
  component: UploadPage,
  title: "features/upload/UploadPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UploadPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// ========================================
// 基本的な初期状態Stories
// ========================================

/**
 * 日本語版アップロードページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
  },
};

/**
 * 英語版アップロードページ
 * 注意: currentUrlPath は本番実装に合わせて "/upload" を使用
 * (英語版でも日本語版と同じパスが使用されている)
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/upload",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/upload",
      },
    },
  },
};

// ========================================
// UIの各状態を表示するStories (初期状態指定)
// ========================================

/**
 * プレビュー状態 - ファイル選択後の確認画面
 */
export const Preview: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "preview",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "ユーザーがファイルを選択した後の確認画面。アップロードボタンとキャンセルボタンが表示されます。",
      },
    },
  },
};

/**
 * アップロード中状態 - プログレスバー表示
 */
export const Uploading: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "uploading",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
    initialUploadProgress: 45,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "ファイルアップロード処理中の状態。進捗45%のプログレスバーが表示されます。",
      },
    },
  },
};

/**
 * アップロード成功状態 - LGTM画像生成完了
 */
export const Success: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "success",
    initialLgtmImageUrl: createLgtmImageUrl(
      "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM"
    ),
    initialPreviewImageUrlForSuccess:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "アップロードが成功しLGTM画像が生成された状態。Markdownコピーボタンと新規アップロードボタンが表示されます。",
      },
    },
  },
};

/**
 * エラー状態 - 猫画像でない場合
 */
export const ErrorNotCatImage: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: [errorMessageNotCatImage("ja")],
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story: "アップロードされた画像に猫が検出されなかった場合のエラー状態。",
      },
    },
  },
};

/**
 * エラー状態 - ファイルサイズが大きすぎる場合
 */
export const ErrorFileTooLarge: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: createImageSizeTooLargeErrorMessage("ja"),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "アップロードされたファイルのサイズが上限 (9MB) を超えた場合のエラー状態。",
      },
    },
  },
};

/**
 * エラー状態 - 人の顔が検出された場合
 */
export const ErrorPersonFaceInImage: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: [errorMessagePersonFaceInImage("ja")],
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "アップロードされた画像に人の顔が検出された場合のエラー状態。プライバシー保護のため拒否されます。",
      },
    },
  },
};

// ========================================
// インタラクティブなStories (モック関数注入)
// ファイルをドロップして実際にアップロードフローをテスト可能
// ========================================

/**
 * インタラクティブ - アップロード成功フロー
 * ファイルをドロップするとモックで成功レスポンスを返す
 */
export const InteractiveSuccess: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    ...createSuccessMocks(),
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/upload",
      },
    },
    docs: {
      description: {
        story:
          "ファイルをドロップすると、モックされた成功レスポンスでアップロードフローを体験できます。",
      },
    },
  },
};
