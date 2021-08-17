// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'jest-fetch-mock';
import { issueAccessToken } from '../../authTokenRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';

describe('authTokenRepository.ts issueAccessToken TestCases', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should be able to issue an access token', async () => {
    const mockBody = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    const mockParams = {
      status: 200,
      statusText: 'OK',
    };

    fetch.mockResponseOnce(JSON.stringify(mockBody), mockParams);

    const accessTokenResult = await issueAccessToken();

    const expectedValue = {
      jwtString: mockBody.access_token,
    };

    expect(isSuccessResult(accessTokenResult)).toBeTruthy();
    expect(accessTokenResult.value).toStrictEqual(expectedValue);
  });

  // TODO 異常系のテストケースを実装する
});
