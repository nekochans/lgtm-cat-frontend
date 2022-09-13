import {
  httpStatusCode,
  cognitoClientId,
  cognitoClientSecret,
} from '../../constants';
import {
  IssueAccessToken,
  AccessToken,
  IssueAccessTokenError,
  apiList,
  appBaseUrl,
  cognitoTokenEndpointUrl,
} from '../../features';
import { CognitoTokenResponseBody } from '../../pages/api/oidc/token';

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

  return responseBody;
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

  return {
    jwtString: responseBody.access_token,
  };
};
