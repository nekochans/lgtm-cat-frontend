import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';

const mockUploadCatImageUnprocessableEntity: ResponseResolver<
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

export default mockUploadCatImageUnprocessableEntity;
