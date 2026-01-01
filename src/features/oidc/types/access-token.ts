// 絶対厳守：編集前に必ずAI実装ルールを読む
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
