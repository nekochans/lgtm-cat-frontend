/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { apiList } from '../../../../../../constants/url';
import IssueAccessTokenError from '../../../../../../domain/errors/IssueAccessTokenError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockTokenEndpoint from '../../../../../../mocks/api/external/cognito/mockTokenEndpoint';
import { issueAccessToken } from '../../authTokenRepository';

const mockHandlers = [
  rest.post(apiList.issueClientCredentialsAccessToken, mockTokenEndpoint),
];

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

  it('should throw an IssueAccessTokenError because the API will return internalServer error', async () => {
    mockServer.use(
      rest.post(
        apiList.issueClientCredentialsAccessToken,
        mockInternalServerError,
      ),
    );

    const expectedValue = new IssueAccessTokenError('Internal Server Error');

    await expect(issueAccessToken()).rejects.toStrictEqual(expectedValue);
  });
});
