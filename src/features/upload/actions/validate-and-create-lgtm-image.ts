// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import type { Language } from "@/features/language";
import { generateR2PresignedGetUrl } from "@/lib/cloudflare/r2/presigned-url";
import { createLgtmImage } from "../functions/create-lgtm-image";
import { validateCatImage } from "../functions/validate-cat-image";
import type { NotAcceptableReason } from "../types/api-response";
import {
  errorMessageNotAcceptable,
  errorMessageNotCatImage,
  errorMessageNotModerationImage,
  errorMessagePayloadTooLarge,
  errorMessagePersonFaceInImage,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * validateAndCreateLgtmImage の結果型
 */
export type ValidateAndCreateLgtmImageResult =
  | {
      readonly success: true;
      readonly createdLgtmImageUrl: string;
      readonly previewImageUrl: string;
    }
  | {
      readonly success: false;
      readonly errorMessages: readonly string[];
    };

/**
 * NotAcceptableReasonからエラーメッセージを取得
 */
function getErrorMessageFromReason(
  reason: NotAcceptableReason,
  language: Language
): string {
  switch (reason) {
    case "not cat image":
      return errorMessageNotCatImage(language);
    case "not moderation image":
      return errorMessageNotModerationImage(language);
    case "person face in the image":
      return errorMessagePersonFaceInImage(language);
    case "not an allowed image extension":
      return errorMessageNotAcceptable(language);
    default:
      return errorMessageUnknown(language);
  }
}

/**
 * 猫画像判定とLGTM画像作成 Server Action
 *
 * 処理フロー:
 * 1. 署名付きGET URLを生成
 * 2. 猫画像判定APIを呼び出し
 * 3. LGTM画像作成APIを呼び出し
 *
 * 注: objectKeyのみを受け取る（画像データは既にR2にアップロード済み）
 */
export async function validateAndCreateLgtmImage(
  objectKey: string,
  language: Language
): Promise<ValidateAndCreateLgtmImageResult> {
  try {
    // 1. 署名付きGET URLを生成
    const { getUrl: signedGetUrl } = await generateR2PresignedGetUrl(objectKey);

    // 2. 猫画像判定APIを呼び出し
    const validateResult = await validateCatImage(signedGetUrl);

    if (!validateResult.success) {
      const errorMessage =
        validateResult.error.name === "PayloadTooLargeError"
          ? errorMessagePayloadTooLarge(language)
          : errorMessageUnknown(language);

      return {
        success: false,
        errorMessages: [errorMessage],
      };
    }

    // 猫画像でない場合はエラー
    if (!validateResult.response.isAcceptableCatImage) {
      const reason =
        (validateResult.response.notAcceptableReason as NotAcceptableReason) ??
        "an error has occurred";
      const errorMessage = getErrorMessageFromReason(reason, language);

      return {
        success: false,
        errorMessages: [errorMessage],
      };
    }

    // 3. LGTM画像作成APIを呼び出し
    const createResult = await createLgtmImage(signedGetUrl);

    if (!createResult.success) {
      return {
        success: false,
        errorMessages: [errorMessageUnknown(language)],
      };
    }

    return {
      success: true,
      createdLgtmImageUrl: createResult.response.imageUrl,
      previewImageUrl: signedGetUrl,
    };
  } catch {
    return {
      success: false,
      errorMessages: [errorMessageUnknown(language)],
    };
  }
}
