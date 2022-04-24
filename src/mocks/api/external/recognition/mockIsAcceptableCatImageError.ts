import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { IsAcceptableCatImageNotAcceptableReason } from '../../../../domain/repositories/imageRepository';

const mockIsAcceptableCatImageError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason:
        'an error has occurred' as IsAcceptableCatImageNotAcceptableReason,
    }),
  );

export default mockIsAcceptableCatImageError;
