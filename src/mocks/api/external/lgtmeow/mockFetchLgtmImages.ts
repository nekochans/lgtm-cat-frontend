import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';
import { fetchLgtmImagesMockBody } from '../../fetchLgtmImagesMockBody';

export const mockFetchLgtmImages: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(ctx.status(httpStatusCode.ok), ctx.json(fetchLgtmImagesMockBody));
