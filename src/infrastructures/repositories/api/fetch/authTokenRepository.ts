import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import { cognitoTokenEndpointUrl } from '../../../../constants/url';
import {
  cognitoClientId,
  cognitoClientSecret,
} from '../../../../constants/secret';
import IssueAccessTokenError from '../../../../domain/errors/IssueAccessTokenError';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import { AccessToken } from '../../../../domain/types/authToken';

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
  try {
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

    if (response.status !== 200 || !cognitoTokenResponseBody.access_token) {
      return createFailureResult<IssueAccessTokenError>(
        new IssueAccessTokenError(),
      );
    }

    return createSuccessResult<AccessToken>({
      jwtString: cognitoTokenResponseBody.access_token,
    });
  } catch (error) {
    // TODO このブロックに入った時は原因不明なエラーなのでSlack等に通知を送信したい
    const newError = new IssueAccessTokenError(error);

    return createFailureResult<IssueAccessTokenError>(newError);
  }
};
