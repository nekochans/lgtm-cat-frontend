export default class IssueAccessTokenError extends Error {
  constructor(error?: string) {
    super(error);
    this.name = new.target.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
