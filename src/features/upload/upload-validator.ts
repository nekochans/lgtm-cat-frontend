// 絶対厳守：編集前に必ずAI実装ルールを読む

import {
  type AllowedImageExtension,
  type AllowedMimeType,
  allowedImageExtensions,
  allowedMimeTypes,
  maxImageSizeBytes,
  type UploadValidationResult,
} from "./types/upload";

/**
 * ファイルのMIMEタイプが許可されているかチェック
 */
function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return allowedMimeTypes.includes(
    mimeType as (typeof allowedMimeTypes)[number]
  );
}

/**
 * ファイルの拡張子を取得
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "").toLowerCase() : "";
}

/**
 * ファイルの拡張子が許可されているかチェック
 */
function isAllowedExtension(
  extension: string
): extension is AllowedImageExtension {
  return allowedImageExtensions.includes(
    extension as (typeof allowedImageExtensions)[number]
  );
}

/**
 * アップロードファイルのバリデーション
 * MIMEタイプと拡張子の両方を検証する
 */
export function validateUploadFile(file: File): UploadValidationResult {
  const extension = getFileExtension(file.name);

  // MIMEタイプのチェック
  if (!isAllowedMimeType(file.type)) {
    return {
      isValid: false,
      errorType: "invalid_extension",
      fileType: extension || file.type,
    };
  }

  // 拡張子のチェック（MIMEタイプが正しくても拡張子が異なる場合を検出）
  if (!isAllowedExtension(extension)) {
    return {
      isValid: false,
      errorType: "invalid_extension",
      fileType: extension || file.type,
    };
  }

  // ファイルサイズのチェック
  if (file.size > maxImageSizeBytes) {
    return {
      isValid: false,
      errorType: "file_too_large",
    };
  }

  return { isValid: true };
}
