import { AccessToken } from '../types/authToken';

export type IssueAccessToken = () => Promise<AccessToken>;
