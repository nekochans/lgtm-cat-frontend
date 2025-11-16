type Options = {
  readonly statusCode?: number;
  readonly statusText?: string;
  readonly headers?: Record<string, string>;
  readonly responseBody?: unknown;
};

export class IssueClientCredentialsAccessTokenError extends Error {
  static {
    IssueClientCredentialsAccessTokenError.prototype.name =
      "IssueClientCredentialsAccessTokenError";
  }

  readonly statusCode: number | undefined;

  readonly statusText: string | undefined;

  readonly headers: Record<string, string> | undefined;

  readonly responseBody: unknown;

  constructor(message = "", options: Options = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}
