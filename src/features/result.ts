export const SuccessMarker = 'SuccessMarker';
export const FailureMarker = 'FailureMarker';

export type SuccessResult<T> = { value: T; _: typeof SuccessMarker };
export type FailureResult<E> = { value: E; _: typeof FailureMarker };
export type Result<T, E> = SuccessResult<T> | FailureResult<E>;

export const createSuccessResult = <T>(value: T): SuccessResult<T> => ({
  value,
  // eslint-disable-next-line id-length
  _: SuccessMarker,
});

export const createFailureResult = <E>(value: E): FailureResult<E> => ({
  value,
  // eslint-disable-next-line id-length
  _: FailureMarker,
});

export const isSuccessResult = <T>(
  result: Result<unknown, unknown>,
): result is SuccessResult<T> => {
  if ('_' in result) {
    return result._ === SuccessMarker;
  }

  return false;
};

export const isFailureResult = <T>(
  result: Result<unknown, unknown>,
): result is FailureResult<T> => {
  if ('_' in result) {
    return result._ === FailureMarker;
  }

  return false;
};
