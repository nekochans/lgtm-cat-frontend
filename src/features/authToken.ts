export type AccessToken = {
  jwtString: string;
};

export type IssueAccessToken = () => Promise<AccessToken>;
