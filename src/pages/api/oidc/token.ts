import { withSentry } from '@sentry/nextjs';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import {
  cognitoClientId,
  cognitoClientSecret,
  httpStatusCode,
} from '../../../constants';
import {
  cognitoTokenEndpointUrl,
  IssueAccessTokenError,
  type AccessToken,
} from '../../../features';

export type CognitoTokenResponseBody = {
  // eslint-disable-next-line camelcase
  access_token: string;
  // eslint-disable-next-line camelcase
  expires_in: number;
  // eslint-disable-next-line camelcase
  token_type: 'Bearer';
};

export type IssueClientCredentialsAccessTokenResponse = AccessToken;

export type IssueClientCredentialsAccessTokenErrorResponse = {
  type: 'MethodNotAllowed';
  title: 'This method is not allowed.';
  status: 405;
};

const methodNotAllowedErrorResponse = (
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >
) => {
  res.status(httpStatusCode.methodNotAllowed).json({
    type: 'MethodNotAllowed',
    title: 'This method is not allowed.',
    status: httpStatusCode.methodNotAllowed,
  });
};

const issueClientCredentialsAccessToken = async (
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >
) => {
  const authorization = Buffer.from(
    `${cognitoClientId()}:${cognitoClientSecret()}`
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

  res.status(httpStatusCode.ok).json({
    jwtString: responseBody.access_token,
  });
};

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >
): Promise<void> => {
  switch (req.method) {
    case 'POST': {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const response = await issueClientCredentialsAccessToken(res);

      return response;
    }
    default: {
      methodNotAllowedErrorResponse(res);
    }
  }
};

export default withSentry(handler);
