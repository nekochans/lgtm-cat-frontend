import {
  type ResponseResolver,
  type MockedRequest,
  type restContext,
} from 'msw';

import { httpStatusCode } from '@/constants';

export const mockUploadCatImagePayloadTooLarge: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (_req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.payloadTooLarge),
    ctx.json({
      error: {
        code: httpStatusCode.payloadTooLarge,
        message: 'UploadCatImageSizeTooLargeError',
      },
    }),
  );
