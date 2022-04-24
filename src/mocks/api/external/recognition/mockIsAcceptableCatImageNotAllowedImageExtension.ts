import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { IsAcceptableCatImageNotAcceptableReason } from '../../../../domain/repositories/imageRepository';

const mockIsAcceptableCatImageNotAllowedImageExtension: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason:
        'not an allowed image extension' as IsAcceptableCatImageNotAcceptableReason,
    }),
  );

export default mockIsAcceptableCatImageNotAllowedImageExtension;
