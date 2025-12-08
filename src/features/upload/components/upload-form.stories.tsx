// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { http } from "msw";
import type { Language } from "@/features/language";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockIsAcceptableCatImageNotModerationImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-moderation-image";
import { mockIsAcceptableCatImagePayloadTooLargeError } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error";
import { mockIsAcceptableCatImagePersonFaceInImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-person-face-in-image";
import { mockUploadCatImage } from "@/mocks/api/external/lgtmeow/mock-upload-cat-image";
import {
  createImageSizeTooLargeErrorMessage,
  errorMessageNotCatImage,
  errorMessageNotModerationImage,
  errorMessagePayloadTooLarge,
  errorMessagePersonFaceInImage,
  errorMessageR2UploadFailed,
} from "../upload-i18n";
import { UploadForm } from "./upload-form";

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
    generateUploadUrl: async () =>
      Promise.resolve({
        success: true as const,
        presignedPutUrl: "https://mock-r2.example.com/upload",
        objectKey: "mock-object-key",
      }),
    uploadToR2: async () => Promise.resolve({ success: true as const }),
    validateAndCreateLgtmImage: async () =>
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

/**
 * エラー用のモック関数群を作成（言語対応）
 */
function createErrorMocks(language: Language) {
  const successMocks = createSuccessMocks();

  return {
    notCatImage: {
      ...successMocks,
      validateAndCreateLgtmImage: async () =>
        Promise.resolve({
          success: false as const,
          errorMessages: [errorMessageNotCatImage(language)],
        }),
    },
    notModerationImage: {
      ...successMocks,
      validateAndCreateLgtmImage: async () =>
        Promise.resolve({
          success: false as const,
          errorMessages: [errorMessageNotModerationImage(language)],
        }),
    },
    payloadTooLarge: {
      ...successMocks,
      validateAndCreateLgtmImage: async () =>
        Promise.resolve({
          success: false as const,
          errorMessages: [errorMessagePayloadTooLarge(language)],
        }),
    },
    personFaceInImage: {
      ...successMocks,
      validateAndCreateLgtmImage: async () =>
        Promise.resolve({
          success: false as const,
          errorMessages: [errorMessagePersonFaceInImage(language)],
        }),
    },
    r2UploadFailed: {
      ...successMocks,
      uploadToR2: async () =>
        Promise.resolve({
          success: false as const,
          error: new Error("Upload failed"),
        }),
    },
  };
}

// 日本語用のモック（デフォルト）
const successMocks = createSuccessMocks();
const errorMocksJa = createErrorMocks("ja");

const meta = {
  component: UploadForm,
  title: "features/upload/UploadForm",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (StoryComponent) => (
      <div className="w-[700px] bg-background p-4">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof UploadForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// ========================================
// 基本的な初期状態Stories
// ========================================

export const Japanese: Story = {
  args: {
    language: "ja",
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
};

// ========================================
// UIの各状態を表示するStories（初期状態指定）
// ========================================

/**
 * プレビュー状態 - ファイル選択後の確認画面
 */
export const Preview: Story = {
  args: {
    language: "ja",
    initialState: "preview",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
  },
};

/**
 * アップロード中状態 - プログレスバー表示
 */
export const Uploading: Story = {
  args: {
    language: "ja",
    initialState: "uploading",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
    initialUploadProgress: 45,
  },
};

/**
 * アップロード成功状態 - LGTM画像生成完了
 */
export const Success: Story = {
  args: {
    language: "ja",
    initialState: "success",
    initialLgtmImageUrl: createLgtmImageUrl(
      "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM"
    ),
    initialPreviewImageUrlForSuccess:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
  },
};

/**
 * エラー状態 - 猫画像でない場合
 */
export const ErrorNotCatImage: Story = {
  args: {
    language: "ja",
    initialState: "error",
    initialErrorMessages: [errorMessageNotCatImage("ja")],
  },
};

/**
 * エラー状態 - ファイルサイズが大きすぎる場合
 */
export const ErrorFileTooLarge: Story = {
  args: {
    language: "ja",
    initialState: "error",
    initialErrorMessages: createImageSizeTooLargeErrorMessage("ja"),
  },
};

/**
 * エラー状態 - 人の顔が検出された場合
 */
export const ErrorPersonFaceInImage: Story = {
  args: {
    language: "ja",
    initialState: "error",
    initialErrorMessages: [errorMessagePersonFaceInImage("ja")],
  },
};

// ========================================
// インタラクティブなStories（モック関数注入）
// ファイルをドロップして実際にアップロードフローをテスト可能
// ========================================

/**
 * インタラクティブ - アップロード成功フロー
 * ファイルをドロップするとモックで成功レスポンスを返す
 */
export const InteractiveSuccess: Story = {
  args: {
    language: "ja",
    ...successMocks,
  },
  parameters: {
    docs: {
      description: {
        story:
          "ファイルをドロップすると、モックされた成功レスポンスでアップロードフローを体験できます。",
      },
    },
  },
};

/**
 * インタラクティブ - 猫画像でないエラー
 */
export const InteractiveErrorNotCatImage: Story = {
  args: {
    language: "ja",
    ...errorMocksJa.notCatImage,
  },
  parameters: {
    docs: {
      description: {
        story:
          "ファイルをドロップすると、猫画像でないというエラーが表示されます。",
      },
    },
  },
};

/**
 * インタラクティブ - 不適切な画像エラー
 */
export const InteractiveErrorNotModerationImage: Story = {
  args: {
    language: "ja",
    ...errorMocksJa.notModerationImage,
  },
};

/**
 * インタラクティブ - サイズが大きすぎるエラー
 */
export const InteractiveErrorPayloadTooLarge: Story = {
  args: {
    language: "ja",
    ...errorMocksJa.payloadTooLarge,
  },
};

/**
 * インタラクティブ - 人の顔検出エラー
 */
export const InteractiveErrorPersonFaceInImage: Story = {
  args: {
    language: "ja",
    ...errorMocksJa.personFaceInImage,
  },
};

/**
 * インタラクティブ - R2アップロード失敗エラー
 */
export const InteractiveErrorR2UploadFailed: Story = {
  args: {
    language: "ja",
    ...errorMocksJa.r2UploadFailed,
  },
};

// ========================================
// MSWハンドラーを使用したStories
// 外部APIのモックをMSWで行う（参考実装）
// 注: Server Actions経由の場合はMSWでモック不可のため、
// 上記のインタラクティブStoriesを推奨
// ========================================

const apiBaseUrl = "https://api.lgtmeow.com";

/**
 * MSW - 成功パターン（参考）
 * 注: Server Actions経由のため実際には動作しません
 */
export const MswSuccess: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImage
        ),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
    docs: {
      description: {
        story:
          "MSWハンドラーの参考実装。Server Actions経由の場合は動作しません。インタラクティブStoriesを使用してください。",
      },
    },
  },
};

/**
 * MSW - 猫画像でないエラー（参考）
 */
export const MswErrorNotCatImage: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImageNotCatImage
        ),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};

/**
 * MSW - 不適切な画像エラー（参考）
 */
export const MswErrorNotModerationImage: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImageNotModerationImage
        ),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};

/**
 * MSW - サイズが大きすぎるエラー（参考）
 */
export const MswErrorPayloadTooLarge: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImagePayloadTooLargeError
        ),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};

/**
 * MSW - 人の顔検出エラー（参考）
 */
export const MswErrorPersonFaceInImage: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImagePersonFaceInImage
        ),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};
