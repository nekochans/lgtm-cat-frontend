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

  private readonly statusCode: number | undefined;

  private readonly statusText: string | undefined;

  private readonly headers: Record<string, string> | undefined;

  private readonly responseBody: unknown;

  constructor(message = "", options: Options = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}
