type Options = {
  statusCode?: number;
  statusText?: string;
  headers?: Record<string, string>;
  responseBody?: unknown;
};

export class FetchLgtmImagesError extends Error {
  static {
    this.prototype.name = 'FetchLgtmImagesError';
  }

  private readonly statusCode: number | undefined;

  private readonly statusText: string | undefined;

  private readonly headers: Record<string, string> | undefined;

  private readonly responseBody: unknown;

  constructor(message = '', options: Options = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}
