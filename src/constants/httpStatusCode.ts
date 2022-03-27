// https://developer.mozilla.org/ja/docs/Web/HTTP/Status から必要なものを抜粋して定義
export const httpStatusCode = {
  ok: 200,
  accepted: 202,
  unauthorized: 400,
  methodNotAllowed: 405,
  payloadTooLarge: 413,
  unprocessableEntity: 422,
  internalServerError: 500,
  serviceUnavailable: 503,
} as const;

export type HttpStatusCode = typeof httpStatusCode[keyof typeof httpStatusCode];
