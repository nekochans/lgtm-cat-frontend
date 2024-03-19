// https://developer.mozilla.org/ja/docs/Web/HTTP/Status から必要なものを抜粋して定義
export const httpStatusCode = {
  ok: 200,
  accepted: 202,
  found: 302,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  payloadTooLarge: 413,
  unprocessableEntity: 422,
  internalServerError: 500,
  serviceUnavailable: 503,
} as const;

export type HttpStatusCode =
  (typeof httpStatusCode)[keyof typeof httpStatusCode];
