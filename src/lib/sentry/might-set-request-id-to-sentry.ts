// 絶対厳守：編集前に必ずAI実装ルールを読む

import { getCurrentScope } from "@sentry/nextjs";

export const mightSetRequestIdToSentry = (response: Response): void => {
  const xRequestId = response.headers.get("x-request-id");
  if (xRequestId != null) {
    getCurrentScope().setTag("x_request_id", xRequestId);
  }
};
