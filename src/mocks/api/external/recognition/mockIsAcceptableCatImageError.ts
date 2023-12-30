import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockIsAcceptableCatImageError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      isAcceptableCatImage: false,
      notAcceptableReason: 'an error has occurred',
    }),
  );
