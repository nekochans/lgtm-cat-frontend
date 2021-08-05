import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from '../../../domain/types/authToken';
import { IssueAccessToken } from '../../../domain/repositories/authTokenRepository';
import {
  cognitoClientId,
  cognitoClientSecret,
} from '../../../constants/secret';
import { cognitoTokenEndpointUrl } from '../../../constants/url';

type ErrorResponseBody = {
  message: 'Method Not Allowed';
};

type CognitoTokenResponseBody = {
  // eslint-disable-next-line camelcase
  access_token: string;
  // eslint-disable-next-line camelcase
  expires_in: 3600;
  // eslint-disable-next-line camelcase
  token_type: 'Bearer';
};

// TODO エラー処理を追加する
const issueAccessTokenFromCognito: IssueAccessToken = async () => {
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

const handler: NextApiHandler = async (
  _req: NextApiRequest,
  res: NextApiResponse<AccessToken | ErrorResponseBody>,
): Promise<void> => {
  if (_req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const accessToken = await issueAccessTokenFromCognito();

  return res.status(201).json(accessToken);
};

export default handler;
