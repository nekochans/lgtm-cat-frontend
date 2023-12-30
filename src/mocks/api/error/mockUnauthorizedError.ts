import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockUnauthorizedError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.unauthorized),
    ctx.json({
      code: httpStatusCode.unauthorized,
      message: 'Unauthorized',
    }),
  );
