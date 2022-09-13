import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockIsAcceptableCatImage: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: true,
    }),
  );
