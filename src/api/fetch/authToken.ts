import { httpStatusCode } from '../../constants';
import {
  IssueAccessToken,
  AccessToken,
  IssueAccessTokenError,
  apiList,
  appBaseUrl,
} from '../../features';

export const issueAccessToken: IssueAccessToken = async () => {
  const options = {
    method: 'POST',
  };

  const response = await fetch(
    `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
    options
  );

  const responseBody = (await response.json()) as AccessToken;

  if (response.status !== httpStatusCode.ok || !responseBody.jwtString) {
    throw new IssueAccessTokenError(response.statusText);
  }

  return responseBody;
};
