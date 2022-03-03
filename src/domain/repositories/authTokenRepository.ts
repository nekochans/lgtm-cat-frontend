import IssueAccessTokenError from '../errors/IssueAccessTokenError';
import { AccessToken } from '../types/authToken';

import { RepositoryResult } from './repositoryResult';

export type IssueAccessToken = () => Promise<
  RepositoryResult<AccessToken, IssueAccessTokenError>
>;
