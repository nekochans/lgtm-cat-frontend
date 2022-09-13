import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockIsAcceptableCatImageNotModerationImage: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason: 'not moderation image',
    }),
  );
