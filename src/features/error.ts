export const errorType = {
  notFound: 404,
  internalServerError: 500,
  serviceUnavailable: 503,
} as const;

export type ErrorType = (typeof errorType)[keyof typeof errorType];
