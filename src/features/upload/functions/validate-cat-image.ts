// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import {
  type ValidateCatImageResponse,
  validateCatImageResponseSchema,
} from "../types/api-response";

class ValidateCatImageError extends Error {
  static {
    ValidateCatImageError.prototype.name = "ValidateCatImageError";
  }
}

class PayloadTooLargeError extends Error {
  static {
    PayloadTooLargeError.prototype.name = "PayloadTooLargeError";
  }
}

type ValidateResult =
  | { readonly success: true; readonly response: ValidateCatImageResponse }
  | {
      readonly success: false;
      readonly error: ValidateCatImageError | PayloadTooLargeError;
    };

/**
 * 猫画像判定APIを呼び出す
 * @see https://api.lgtmeow.com/redoc#tag/Cat-Images/operation/validate_cat_image_from_url_cat_images_validate_url_post
 */
export async function validateCatImage(
  signedImageUrl: string
): Promise<ValidateResult> {
  let accessToken: string;
  try {
    accessToken = await issueClientCredentialsAccessToken();
  } catch {
    return {
      success: false,
      error: new ValidateCatImageError("Failed to issue access token"),
    };
  }

  const endpoint = `${lgtmeowApiUrl()}/cat-images/validate/url`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl: signedImageUrl }),
  });

  if (response.status === httpStatusCode.payloadTooLarge) {
    return {
      success: false,
      error: new PayloadTooLargeError("Image file is too large"),
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: new ValidateCatImageError(
        `API request failed with status ${response.status}`
      ),
    };
  }

  const responseBody: unknown = await response.json();
  const parseResult = validateCatImageResponseSchema.safeParse(responseBody);

  if (!parseResult.success) {
    return {
      success: false,
      error: new ValidateCatImageError("Invalid API response format"),
    };
  }

  return { success: true, response: parseResult.data };
}
