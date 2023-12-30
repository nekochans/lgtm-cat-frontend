import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockInternalServerError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.internalServerError),
    ctx.json({
      code: httpStatusCode.internalServerError,
      message: 'Internal Server Error',
    }),
  );
