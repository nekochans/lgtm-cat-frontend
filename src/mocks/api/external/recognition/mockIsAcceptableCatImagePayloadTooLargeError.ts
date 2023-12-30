import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockIsAcceptableCatImagePayloadTooLargeError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(ctx.status(httpStatusCode.payloadTooLarge));
