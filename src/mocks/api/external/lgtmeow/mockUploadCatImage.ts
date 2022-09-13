import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants';

export const mockUploadCatImage: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (_req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.accepted),
    ctx.json({
      imageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    }),
  );
