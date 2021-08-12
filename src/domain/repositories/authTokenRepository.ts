import { AccessToken } from '../types/authToken';
import IssueAccessTokenError from '../errors/IssueAccessTokenError';
import { RepositoryResult } from './repositoryResult';

export type IssueAccessToken = () => Promise<
  RepositoryResult<AccessToken, IssueAccessTokenError>
>;
