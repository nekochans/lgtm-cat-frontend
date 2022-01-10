import fetchMock from 'fetch-mock-jest';
import { issueAccessToken } from '../../authTokenRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import { cognitoTokenEndpointUrl } from '../../../../../../constants/url';

describe('authTokenRepository.ts issueAccessToken TestCases', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('should be able to issue an access token', async () => {
    const mockBody = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    fetchMock.post(cognitoTokenEndpointUrl(), { status: 200, body: mockBody });

    const accessTokenResult = await issueAccessToken();

    const expectedValue = {
      jwtString: mockBody.access_token,
    };

    expect(isSuccessResult(accessTokenResult)).toBeTruthy();
    expect(accessTokenResult.value).toStrictEqual(expectedValue);
  });

  // TODO 異常系のテストケースを実装する
});
