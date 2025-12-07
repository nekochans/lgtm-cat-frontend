// 絶対厳守：編集前に必ずAI実装ルールを読む

import { http, type ResponseResolver } from "msw";
import { mockCreateLgtmImageError } from "../api/external/lgtmeow/mock-create-lgtm-image-error";
import { mockIsAcceptableCatImage } from "../api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockUploadCatImage } from "../api/external/lgtmeow/mock-upload-cat-image";

const apiBaseUrl = "https://api.lgtmeow.com";

/**
 * 成功パターンのハンドラ
 */
export const uploadSuccessHandlers = [
  http.post(`${apiBaseUrl}/cat-images/validate/url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
];

/**
 * 猫画像判定APIのエラーパターン用ハンドラを作成するヘルパー
 */
export function createValidationErrorHandlers(
  validateMockResolver: ResponseResolver
) {
  return [
    http.post(`${apiBaseUrl}/cat-images/validate/url`, validateMockResolver),
    http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
  ];
}

/**
 * LGTM画像作成APIのエラーパターン用ハンドラを作成するヘルパー
 */
export function createLgtmCreationErrorHandlers(
  lgtmMockResolver: ResponseResolver = mockCreateLgtmImageError
) {
  return [
    http.post(
      `${apiBaseUrl}/cat-images/validate/url`,
      mockIsAcceptableCatImage
    ),
    http.post(`${apiBaseUrl}/v2/lgtm-images`, lgtmMockResolver),
  ];
}

/**
 * LGTM画像作成APIがエラーを返すハンドラ（デフォルト500エラー）
 */
export const uploadLgtmCreationErrorHandlers =
  createLgtmCreationErrorHandlers();
