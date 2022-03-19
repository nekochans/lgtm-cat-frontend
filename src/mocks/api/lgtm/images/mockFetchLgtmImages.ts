import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';
import fetchLgtmImagesMockBody from '../../fetchLgtmImagesMockBody';

const mockFetchLgtmImages: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(ctx.status(httpStatusCode.ok), ctx.json(fetchLgtmImagesMockBody));

export default mockFetchLgtmImages;
