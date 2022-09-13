import {
  createSuccessResult as orgCreateSuccessResult,
  createFailureResult as orgCreateFailureResult,
  isSuccessResult as orgIsSuccessResult,
  isFailureResult as orgIsFailureResult,
  Result as OrgResult,
} from '@nekochans/lgtm-cat-ui';

export type Result<T, E> = OrgResult<T, E>;

export const createSuccessResult = orgCreateSuccessResult;

export const createFailureResult = orgCreateFailureResult;

export const isSuccessResult = orgIsSuccessResult;

export const isFailureResult = orgIsFailureResult;
