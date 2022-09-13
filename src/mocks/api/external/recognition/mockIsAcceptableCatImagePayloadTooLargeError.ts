import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockIsAcceptableCatImagePayloadTooLargeError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) => res(ctx.status(httpStatusCode.payloadTooLarge));
