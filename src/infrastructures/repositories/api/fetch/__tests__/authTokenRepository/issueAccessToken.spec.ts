/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { cognitoTokenEndpointUrl } from '../../../../../../constants/url';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import tokenEndpoint from '../../../../../../mocks/api/external/cognito/tokenEndpoint';
import { issueAccessToken } from '../../authTokenRepository';

const mockHandlers = [rest.post(cognitoTokenEndpointUrl(), tokenEndpoint)];

const mockServer = setupServer(...mockHandlers);

describe('authTokenRepository.ts issueAccessToken TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  it('should be able to issue an access token', async () => {
    const accessTokenResult = await issueAccessToken();

    const expectedValue = {
      jwtString:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    };

    expect(isSuccessResult(accessTokenResult)).toBeTruthy();
    expect(accessTokenResult.value).toStrictEqual(expectedValue);
  });

  // TODO 異常系のテストケースを実装する
});
