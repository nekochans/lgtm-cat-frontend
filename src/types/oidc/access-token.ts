export type JwtAccessTokenString = string & {
  readonly __brand: "jwtAccessTokenString";
};

export function createJwtAccessTokenString(
  token: string
): JwtAccessTokenString {
  return token as JwtAccessTokenString;
}

export type IssueClientCredentialsAccessToken =
  () => Promise<JwtAccessTokenString>;
