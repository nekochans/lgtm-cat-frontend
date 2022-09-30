// このファイル内の関数はサーバーサイドでしか動作しない
export const cognitoClientId = (): string =>
  process.env.COGNITO_CLIENT_ID != null ? process.env.COGNITO_CLIENT_ID : '';

export const cognitoClientSecret = (): string =>
  process.env.COGNITO_CLIENT_SECRET != null
    ? process.env.COGNITO_CLIENT_SECRET
    : '';
