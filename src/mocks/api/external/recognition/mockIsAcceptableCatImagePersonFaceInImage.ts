import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { IsAcceptableCatImageNotAcceptableReason } from '../../../../domain/repositories/imageRepository';

const mockIsAcceptableCatImagePersonFaceInImage: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason:
        'person face in the image' as IsAcceptableCatImageNotAcceptableReason,
    }),
  );

export default mockIsAcceptableCatImagePersonFaceInImage;
