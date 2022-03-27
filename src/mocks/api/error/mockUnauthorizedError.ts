import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../constants/httpStatusCode';

const mockUnauthorizedError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.unauthorized),
    ctx.json({
      code: httpStatusCode.unauthorized,
      message: 'Unauthorized',
    }),
  );

export default mockUnauthorizedError;
