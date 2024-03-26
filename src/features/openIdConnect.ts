export type JwtAccessTokenString = string;

export type IssueClientCredentialsAccessToken =
  () => Promise<JwtAccessTokenString>;
