import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';

const mockUploadCatImageIssueAccessTokenError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.internalServerError),
    ctx.json({
      error: {
        code: httpStatusCode.internalServerError,
        message: 'IssueAccessTokenError',
      },
    }),
  );

export default mockUploadCatImageIssueAccessTokenError;
