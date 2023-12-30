import { httpStatusCode } from '@/constants';
import {
  type MockedRequest,
  type ResponseResolver,
  type restContext,
} from 'msw';

export const mockUploadCatImage: ResponseResolver<
  MockedRequest,
  typeof restContext
> = async (_req, res, ctx) =>
  await res(
    ctx.status(httpStatusCode.accepted),
    ctx.json({
      createdLgtmImageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    }),
  );
