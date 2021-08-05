import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import { apiList } from '../../../../constants/url';
import { AccessToken } from '../../../../domain/types/authToken';

// eslint-disable-next-line import/prefer-default-export
export const issueAccessToken: IssueAccessToken = async () => {
  const options = {
    method: 'POST',
  };

  const response = await fetch(apiList.issueAccessToken, options);

  return (await response.json()) as AccessToken;
};
