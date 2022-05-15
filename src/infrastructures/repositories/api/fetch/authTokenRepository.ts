import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { apiList, appBaseUrl } from '../../../../constants/url';
import IssueAccessTokenError from '../../../../domain/errors/IssueAccessTokenError';
import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import { createSuccessResult } from '../../../../domain/repositories/repositoryResult';
import { AccessToken } from '../../../../domain/types/authToken';

// eslint-disable-next-line import/prefer-default-export
export const issueAccessToken: IssueAccessToken = async () => {
  const options = {
    method: 'POST',
  };

  const response = await fetch(
    `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
    options,
  );

  const responseBody = (await response.json()) as AccessToken;

  if (response.status !== httpStatusCode.ok || !responseBody.jwtString) {
    throw new IssueAccessTokenError(response.statusText);
  }

  return createSuccessResult<AccessToken>(responseBody);
};
