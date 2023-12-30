import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

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
