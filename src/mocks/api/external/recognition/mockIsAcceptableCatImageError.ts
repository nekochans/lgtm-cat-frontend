import {
  type ResponseResolver,
  type MockedRequest,
  type restContext,
} from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockIsAcceptableCatImageError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason: 'an error has occurred',
    })
  );
