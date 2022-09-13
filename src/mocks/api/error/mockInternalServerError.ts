import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../constants';

export const mockInternalServerError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.internalServerError),
    ctx.json({
      code: httpStatusCode.internalServerError,
      message: 'Internal Server Error',
    }),
  );
