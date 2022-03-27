import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';

const mockUploadCatImageAuthError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.unauthorized),
    ctx.json({
      error: {
        code: httpStatusCode.unauthorized,
        message: 'Unauthorized',
      },
    }),
  );

export default mockUploadCatImageAuthError;
