import { getCurrentScope } from "@sentry/nextjs";

export const mightSetRequestIdToSentry = (response: Response): void => {
  const xRequestId = response.headers.get("x-request-id");
  if (xRequestId != null) {
    getCurrentScope().setTag("x_request_id", xRequestId);
  }
};
