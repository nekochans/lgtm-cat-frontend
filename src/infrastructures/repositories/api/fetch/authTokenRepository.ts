import { httpStatusCode } from '../../../../constants/httpStatusCode';
import { apiList } from '../../../../constants/url';
import IssueAccessTokenError from '../../../../domain/errors/IssueAccessTokenError';
import { IssueAccessToken } from '../../../../domain/repositories/authTokenRepository';
import {
  createFailureResult,
  createSuccessResult,
} from '../../../../domain/repositories/repositoryResult';
import { AccessToken } from '../../../../domain/types/authToken';

// eslint-disable-next-line import/prefer-default-export
export const issueAccessToken: IssueAccessToken = async () => {
  try {
    const options = {
      method: 'POST',
    };

    const response = await fetch(
      apiList.issueClientCredentialsAccessToken,
      options,
    );

    const responseBody = (await response.json()) as AccessToken;

    if (response.status !== httpStatusCode.ok || !responseBody.jwtString) {
      return createFailureResult<IssueAccessTokenError>(
        new IssueAccessTokenError(),
      );
    }

    return createSuccessResult<AccessToken>(responseBody);
  } catch (error) {
    // TODO このブロックに入った時は原因不明なエラーなのでSlack等に通知を送信したい
    const newError =
      error instanceof Error
        ? new IssueAccessTokenError(error)
        : new IssueAccessTokenError(
            new Error('issueAccessToken Unexpected error'),
          );

    return createFailureResult<IssueAccessTokenError>(newError);
  }
};
