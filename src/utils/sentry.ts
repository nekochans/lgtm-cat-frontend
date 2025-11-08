// 絶対厳守：編集前に必ずAI実装ルールを読む
import { getCurrentScope } from "@sentry/nextjs";

export function mightSetRequestIdToSentry(response: Response): void {
  const xRequestId = response.headers.get("x-request-id");
  if (xRequestId != null) {
    getCurrentScope().setTag("x_request_id", xRequestId);
  }

  const lambdaRequestId = response.headers.get("x-lambda-request-id");
  if (lambdaRequestId != null) {
    getCurrentScope().setTag("x_lambda_request_id", lambdaRequestId);
  }
}
