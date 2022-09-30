import * as Sentry from '@sentry/nextjs';

export const mightSetRequestIdToSentry = (response: Response): void => {
  const xRequestId = response.headers.get('x-request-id');
  if (xRequestId != null) {
    Sentry.configureScope((scope) => {
      scope.setTag('x_request_id', xRequestId);
    });
  }

  const lambdaRequestId = response.headers.get('x-lambda-request-id');
  if (lambdaRequestId != null) {
    Sentry.configureScope((scope) => {
      scope.setTag('x_lambda_request_id', lambdaRequestId);
    });
  }
};
