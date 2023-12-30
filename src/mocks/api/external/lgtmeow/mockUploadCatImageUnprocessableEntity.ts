import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockUploadCatImageUnprocessableEntity: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (_req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.unprocessableEntity),
    ctx.json({
      error: {
        code: httpStatusCode.unprocessableEntity,
        message: 'UploadCatImageValidationError',
      },
    }),
  );
