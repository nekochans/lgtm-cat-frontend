import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../../constants/httpStatusCode';

const mockTokenEndpoint: ResponseResolver<MockedRequest, typeof restContext> = (
  _req,
  res,
  ctx,
) =>
  res(
    ctx.status(httpStatusCode.ok),
    ctx.json({
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expires_in: 3600,
      token_type: 'Bearer',
    }),
  );

export default mockTokenEndpoint;
