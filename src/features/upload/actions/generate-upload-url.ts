// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import type { Language } from "@/features/language";
import { generateR2PresignedPutUrl } from "@/lib/cloudflare/r2/presigned-url";
import { allowedMimeTypes, maxImageSizeBytes } from "../types/upload";
import {
  errorMessageFileTooLarge,
  errorMessageInvalidMimeType,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * generateUploadUrl の結果型
 */
export type GenerateUploadUrlResult =
  | {
      readonly success: true;
      readonly presignedPutUrl: string;
      readonly objectKey: string;
    }
  | {
      readonly success: false;
      readonly errorMessages: readonly string[];
    };

/**
 * 署名付きPUT URL生成 Server Action
 *
 * 処理フロー:
 * 1. [前検証] MIMEタイプ・ファイルサイズをサーバー側で検証
 * 2. 署名付きPUT URLを生成
 *
 * 注: 画像データは受け取らない（Server Actionのボディサイズ制限対策）
 */
export async function generateUploadUrl(
  contentType: string,
  fileSize: number,
  language: Language
): Promise<GenerateUploadUrlResult> {
  // 1. [前検証] MIMEタイプチェック
  if (
    !allowedMimeTypes.includes(contentType as (typeof allowedMimeTypes)[number])
  ) {
    return {
      success: false,
      errorMessages: [errorMessageInvalidMimeType(language)],
    };
  }

  // 1. [前検証] ファイルサイズチェック
  if (fileSize > maxImageSizeBytes) {
    return {
      success: false,
      errorMessages: [errorMessageFileTooLarge(language)],
    };
  }

  try {
    // 2. 署名付きPUT URLを生成
    const result = await generateR2PresignedPutUrl(contentType);

    return {
      success: true,
      presignedPutUrl: result.putUrl,
      objectKey: result.objectKey,
    };
  } catch {
    return {
      success: false,
      errorMessages: [errorMessageUnknown(language)],
    };
  }
}
