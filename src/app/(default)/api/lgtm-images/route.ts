// 絶対厳守：編集前に必ずAI実装ルールを読む

import { captureException } from "@sentry/nextjs";
import { httpStatusCode } from "@/constants/http-status-code";
import {
  FetchLgtmImagesError,
  fetchLgtmImagesInRandom,
} from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import { mightSetRequestIdToSentryFromError } from "@/lib/sentry/might-set-request-id-to-sentry-from-error";
import type { LgtmImageApiErrorResponse } from "./types";

/**
 * GET /api/lgtm-images
 * 後方互換性維持のためのLGTM画像取得APIエンドポイント
 */
export async function GET(): Promise<Response> {
  try {
    const accessToken = await issueClientCredentialsAccessToken();
    const lgtmImages = await fetchLgtmImagesInRandom(accessToken);

    return Response.json(lgtmImages, {
      status: httpStatusCode.ok,
    });
  } catch (error) {
    // FetchLgtmImagesError の場合は x-request-id を Sentry に設定
    if (error instanceof FetchLgtmImagesError) {
      mightSetRequestIdToSentryFromError(error);
    }

    // Sentry にエラーを送信
    captureException(error);

    const errorResponse: LgtmImageApiErrorResponse = {
      code: httpStatusCode.internalServerError,
      message: "Internal Server Error",
    };

    return Response.json(errorResponse, {
      status: httpStatusCode.internalServerError,
    });
  }
}
