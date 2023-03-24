import {
  type ResponseResolver,
  type MockedRequest,
  type restContext,
} from 'msw';

import { httpStatusCode } from '../../../constants';

export const mockUnauthorizedError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.unauthorized),
    ctx.json({
      code: httpStatusCode.unauthorized,
      message: 'Unauthorized',
    })
  );
