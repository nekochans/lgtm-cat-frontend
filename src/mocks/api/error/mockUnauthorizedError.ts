import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../constants';

export const mockUnauthorizedError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.unauthorized),
    ctx.json({
      code: httpStatusCode.unauthorized,
      message: 'Unauthorized',
    }),
  );
