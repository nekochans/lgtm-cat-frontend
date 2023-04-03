import {
  type ResponseResolver,
  type MockedRequest,
  type restContext,
} from 'msw';

import { httpStatusCode } from '@/constants';
import { fetchLgtmImagesMockBody } from '@/mocks';

export const mockFetchLgtmImages: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(ctx.status(httpStatusCode.ok), ctx.json(fetchLgtmImagesMockBody));
