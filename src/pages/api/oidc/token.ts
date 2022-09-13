import { withSentry } from '@sentry/nextjs';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import {
  cognitoClientId,
  cognitoClientSecret,
  httpStatusCode,
  type HttpStatusCode,
} from '../../../constants';
import { cognitoTokenEndpointUrl, type AccessToken } from '../../../features';

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
  error?: {
    code: HttpStatusCode;
    message: string;
  };
};

const methodNotAllowedErrorResponse = (
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >,
) =>
  res.status(httpStatusCode.methodNotAllowed).json({
    error: {
      code: httpStatusCode.methodNotAllowed,
      message: 'Method Not Allowed',
    },
  });

const issueClientCredentialsAccessToken = async (
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >,
) => {
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
    return res.status(httpStatusCode.internalServerError).json({
      error: {
        code: httpStatusCode.internalServerError,
        message: 'Internal Server Error',
      },
    });
  }

  const responseBody = (await response.json()) as CognitoTokenResponseBody;

  return res.status(httpStatusCode.ok).json({
    jwtString: responseBody.access_token,
  });
};

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    | IssueClientCredentialsAccessTokenResponse
    | IssueClientCredentialsAccessTokenErrorResponse
  >,
): Promise<void> => {
  switch (req.method) {
    case 'POST': {
      const response = await issueClientCredentialsAccessToken(res);

      return response;
    }
    default: {
      return methodNotAllowedErrorResponse(res);
    }
  }
};

export default withSentry(handler);
