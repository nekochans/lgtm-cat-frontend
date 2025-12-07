// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import {
  type CreateLgtmImageResponse,
  createLgtmImageResponseSchema,
} from "../types/api-response";

class CreateLgtmImageError extends Error {
  static {
    CreateLgtmImageError.prototype.name = "CreateLgtmImageError";
  }
}

type CreateResult =
  | { readonly success: true; readonly response: CreateLgtmImageResponse }
  | { readonly success: false; readonly error: CreateLgtmImageError };

/**
 * LGTM画像作成APIを呼び出す
 * @see https://api.lgtmeow.com/redoc#tag/LGTM-Images-V2/operation/create_lgtm_image_from_url_v2_lgtm_images_post
 */
export async function createLgtmImage(
  signedImageUrl: string
): Promise<CreateResult> {
  let accessToken: string;
  try {
    accessToken = await issueClientCredentialsAccessToken();
  } catch {
    return {
      success: false,
      error: new CreateLgtmImageError("Failed to issue access token"),
    };
  }

  const endpoint = `${lgtmeowApiUrl()}/v2/lgtm-images`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl: signedImageUrl }),
  });

  // 成功時は 202 Accepted
  if (response.status !== httpStatusCode.accepted) {
    return {
      success: false,
      error: new CreateLgtmImageError(
        `API request failed with status ${response.status}`
      ),
    };
  }

  const responseBody: unknown = await response.json();
  const parseResult = createLgtmImageResponseSchema.safeParse(responseBody);

  if (!parseResult.success) {
    return {
      success: false,
      error: new CreateLgtmImageError("Invalid API response format"),
    };
  }

  return { success: true, response: parseResult.data };
}
