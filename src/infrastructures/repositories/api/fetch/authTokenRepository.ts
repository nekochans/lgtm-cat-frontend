import { httpStatusCode } from '../../../../constants/httpStatusCode';
import {
  cognitoClientId,
  cognitoClientSecret,
} from '../../../../constants/secret';
import {
  apiList,
  appBaseUrl,
  cognitoTokenEndpointUrl,
} from '../../../../constants/url';
import IssueAccessTokenError from '../../../../domain/errors/IssueAccessTokenError';
import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import { createSuccessResult } from '../../../../domain/repositories/repositoryResult';
import { AccessToken } from '../../../../domain/types/authToken';
import { CognitoTokenResponseBody } from '../../../../pages/api/oidc/token';

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

/*
 * この関数はサーバーサイドでしか動作しない
 * TODO Cloudflare WorkersでAPI Proxyを構築するなどしてアクセストークン周りの処理は将来的に API Proxy に移行したい
 * https://github.com/nekochans/lgtm-cat/issues/17
 */
export const issueAccessTokenOnServer: IssueAccessToken = async () => {
  const authorization = Buffer.from(
    `${cognitoClientId()}:${cognitoClientSecret()}`,
  ).toString('base64');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
    },
    body: 'grant_type=client_credentials&scope=api.lgtmeow/all image-recognition-api.lgtmeow/all',
  };

  const response = await fetch(cognitoTokenEndpointUrl(), options);
  if (!response.ok) {
    throw new IssueAccessTokenError(response.statusText);
  }

  const responseBody = (await response.json()) as CognitoTokenResponseBody;

  return createSuccessResult<AccessToken>({
    jwtString: responseBody.access_token,
  });
};
