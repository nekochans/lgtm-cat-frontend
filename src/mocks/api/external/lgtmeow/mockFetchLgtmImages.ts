import { httpStatusCode } from '@/constants';
import { fetchLgtmImagesMockBody } from '@/mocks';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockFetchLgtmImages: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (req, res, ctx) =>
  await res(ctx.status(httpStatusCode.ok), ctx.json(fetchLgtmImagesMockBody));
