import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import { cognitoTokenEndpointUrl } from '../../../../constants/url';
import {
  cognitoClientId,
  cognitoClientSecret,
} from '../../../../constants/secret';

type CognitoTokenResponseBody = {
  // eslint-disable-next-line camelcase
  access_token: string;
  // eslint-disable-next-line camelcase
  expires_in: 3600;
  // eslint-disable-next-line camelcase
  token_type: 'Bearer';
};

// eslint-disable-next-line import/prefer-default-export
export const issueAccessToken: IssueAccessToken = async () => {
  const authorization = Buffer.from(
    `${cognitoClientId()}:${cognitoClientSecret()}`,
  ).toString('base64');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
    },
    body: 'grant_type=client_credentials&scope=api.lgtmeow/all',
  };

  const response = await fetch(cognitoTokenEndpointUrl(), options);

  const cognitoTokenResponseBody =
    (await response.json()) as CognitoTokenResponseBody;

  return { jwtString: cognitoTokenResponseBody.access_token };
};
