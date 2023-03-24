import {
  type ResponseResolver,
  type MockedRequest,
  type restContext,
} from 'msw';

import { httpStatusCode } from '../../../../constants';

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
    })
  );
