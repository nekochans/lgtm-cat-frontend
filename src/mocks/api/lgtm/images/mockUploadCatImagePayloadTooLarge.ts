import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';

const mockUploadCatImagePayloadTooLarge: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.payloadTooLarge),
    ctx.json({
      error: {
        code: httpStatusCode.payloadTooLarge,
        message: 'UploadCatImageSizeTooLargeError',
      },
    }),
  );

export default mockUploadCatImagePayloadTooLarge;
