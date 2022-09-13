import * as Sentry from '@sentry/nextjs';

export const mightSetRequestIdToSentry = async (response: Response) => {
  const xRequestId = await response.headers.get('x-request-id');
  if (xRequestId) {
    Sentry.configureScope((scope) => {
      scope.setTag('x_request_id', xRequestId);
    });
  }

  const lambdaRequestId = await response.headers.get('x-lambda-request-id');
  if (lambdaRequestId) {
    Sentry.configureScope((scope) => {
      scope.setTag('x_lambda_request_id', lambdaRequestId);
    });
  }
};
