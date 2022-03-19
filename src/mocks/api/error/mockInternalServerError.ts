import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../constants/httpStatusCode';

const mockInternalServerError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.internalServerError),
    ctx.json({
      code: httpStatusCode.internalServerError,
      message: 'Internal Server Error',
    }),
  );

export default mockInternalServerError;
