// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { UploadToStorageFn as StorageFn } from "./storage";

/**
 * 許可される画像の拡張子
 */
export const allowedImageExtensions = ["png", "jpg", "jpeg"] as const;

export type AllowedImageExtension = (typeof allowedImageExtensions)[number];

/**
 * 許可される画像のMIMEタイプ
 */
export const allowedMimeTypes = ["image/png", "image/jpeg"] as const;

export type AllowedMimeType = (typeof allowedMimeTypes)[number];

/**
 * 画像サイズの上限（バイト単位）
 * 5MB = 5 * 1024 * 1024 = 5242880 bytes
 */
export const maxImageSizeBytes = 5 * 1024 * 1024;

/**
 * 画像サイズの上限（表示用テキスト）
 */
export const acceptableImageSizeThresholdText = "5MB";

/**
 * バリデーションエラーの種類
 */
export type UploadValidationErrorType =
  | "invalid_extension"
  | "file_too_large"
  | "unknown_error";

/**
 * バリデーション結果
 */
export type UploadValidationResult =
  | { readonly isValid: true }
  | {
      readonly isValid: false;
      readonly errorType: UploadValidationErrorType;
      readonly fileType?: string;
    };

/**
 * アップロードフォームの状態
 */
export type UploadFormState =
  | "idle" // 初期状態（ドロップエリア表示）
  | "preview" // プレビュー表示中
  | "uploading" // アップロード中（将来実装用）
  | "success" // 成功（将来実装用）
  | "error"; // エラー表示中

/**
 * モックアップロードの結果
 */
export type MockUploadResult =
  | { readonly success: true; readonly imageUrl: string }
  | { readonly success: false; readonly errorMessage: string };

/**
 * アップロード進捗のコールバック型
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 依存性注入用の型定義
 * Storybook等でモック可能にするため、Server Actions相当の関数を外部から注入できるようにする
 */

// Re-export for convenience
export type { GenerateUploadUrlResult } from "../actions/generate-upload-url";
export type { ValidateAndCreateLgtmImageResult } from "../actions/validate-and-create-lgtm-image";
export type { UploadToStorageFn, UploadToStorageResult } from "./storage";

/**
 * generateUploadUrl関数の型
 */
export type GenerateUploadUrlFn = (
  contentType: string,
  fileSize: number,
  language: import("@/features/language").Language
) => Promise<import("../actions/generate-upload-url").GenerateUploadUrlResult>;

/**
 * validateAndCreateLgtmImage関数の型
 */
export type ValidateAndCreateLgtmImageFn = (
  objectKey: string,
  language: import("@/features/language").Language
) => Promise<
  import("../actions/validate-and-create-lgtm-image").ValidateAndCreateLgtmImageResult
>;

/**
 * UploadForm依存関係（Storybook等でのモック用）
 */
export type UploadFormDependencies = {
  readonly generateUploadUrl: GenerateUploadUrlFn;
  readonly uploadToStorage: StorageFn;
  readonly validateAndCreateLgtmImage: ValidateAndCreateLgtmImageFn;
};
