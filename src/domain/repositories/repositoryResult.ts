export const SuccessMarker = 'SuccessMarker';
export const FailureMarker = 'FailureMarker';

export type SuccessResult<T> = { value: T; marker: typeof SuccessMarker };
export type FailureResult<E> = { value: E; marker: typeof FailureMarker };
export type RepositoryResult<T, E> = SuccessResult<T> | FailureResult<E>;

export const createSuccessResult = <T>(value: T): SuccessResult<T> => ({
  value,
  marker: SuccessMarker,
});

export const createFailureResult = <E>(value: E): FailureResult<E> => ({
  value,
  marker: FailureMarker,
});

export const isSuccessResult = <T>(
  result: RepositoryResult<unknown, unknown>,
): result is SuccessResult<T> => {
  if ('marker' in result) {
    return result.marker === SuccessMarker;
  }

  return false;
};
