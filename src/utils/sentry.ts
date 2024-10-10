import * as Sentry from '@sentry/nextjs';

export function mightSetRequestIdToSentry(response: Response): void {
  const xRequestId = response.headers.get('x-request-id');
  if (xRequestId != null) {
    Sentry.getCurrentScope().setTag('x_request_id', xRequestId);
  }

  const lambdaRequestId = response.headers.get('x-lambda-request-id');
  if (lambdaRequestId != null) {
    Sentry.getCurrentScope().setTag('x_lambda_request_id', lambdaRequestId);
  }
}
