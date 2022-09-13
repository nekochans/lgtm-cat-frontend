import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockUploadCatImageUnprocessableEntity: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.unprocessableEntity),
    ctx.json({
      error: {
        code: httpStatusCode.unprocessableEntity,
        message: 'UploadCatImageValidationError',
      },
    }),
  );
