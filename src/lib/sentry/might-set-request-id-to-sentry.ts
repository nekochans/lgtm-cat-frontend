import * as Sentry from '@sentry/nextjs';

export const mightSetRequestIdToSentry = (response: Response): void => {
  const xRequestId = response.headers.get('x-request-id');
  if (xRequestId != null) {
    Sentry.getCurrentScope().setTag('x_request_id', xRequestId);
  }
};
