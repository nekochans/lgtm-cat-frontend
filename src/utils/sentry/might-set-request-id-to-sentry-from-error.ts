import { getCurrentScope } from "@sentry/nextjs";

/**
 * headers プロパティを持つエラーオブジェクトの型
 */
interface ErrorWithHeaders {
  readonly headers?: Record<string, string>;
}

/**
 * エラーオブジェクトから x-request-id を取得し、Sentry のタグに設定する
 * FetchLgtmImagesError などの headers プロパティを持つエラーに対応
 */
export const mightSetRequestIdToSentryFromError = (
  error: ErrorWithHeaders
): void => {
  const xRequestId = error.headers?.["x-request-id"];
  if (xRequestId != null) {
    getCurrentScope().setTag("x_request_id", xRequestId);
  }
};
