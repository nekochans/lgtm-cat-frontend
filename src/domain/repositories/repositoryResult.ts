export const SuccessMarker = 'SuccessMarker';
export const FailureMarker = 'FailureMarker';

export type SuccessResult<T> = { value: T; _: typeof SuccessMarker };
export type FailureResult<E> = { value: E; _: typeof FailureMarker };
export type RepositoryResult<T, E> = SuccessResult<T> | FailureResult<E>;

export const createSuccessResult = <T>(value: T): SuccessResult<T> => ({
  value,
  _: SuccessMarker,
});

export const createFailureResult = <E>(value: E): FailureResult<E> => ({
  value,
  _: FailureMarker,
});

export const isSuccessResult = <T>(
  result: RepositoryResult<unknown, unknown>,
): result is SuccessResult<T> => {
  if ('_' in result) {
    return result._ === SuccessMarker;
  }

  return false;
};
