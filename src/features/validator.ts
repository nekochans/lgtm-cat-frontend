import { ZodError, type z } from 'zod';

type InvalidParam = {
  name: string;
  reason: string;
};

export type InvalidParams = InvalidParam[];

export type ValidationResult = {
  isValidate: boolean;
  invalidParams?: InvalidParams;
};

const isInvalidParams = (value: unknown): value is InvalidParams => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const object = value[0];
    if (Object.prototype.toString.call(object) !== '[object Object]') {
      return false;
    }

    const invalidParam = object as InvalidParam;
    if (!Object.prototype.hasOwnProperty.call(invalidParam, 'name')) {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(invalidParam, 'reason');
  }

  return false;
};

const isZodError = (error: unknown): error is ZodError => {
  if (error instanceof ZodError) {
    return true;
  }

  if (error instanceof Error) {
    if (error.name === 'ZodError') {
      return true;
    }
  }

  return false;
};

export const createSchemaFromType =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(arg: S) =>
    arg;

type ValidationSchema = {
  parse: (params: unknown) => unknown;
};

export const validation = (
  schema: ValidationSchema,
  params: unknown,
): ValidationResult => {
  try {
    schema.parse(params);

    return { isValidate: true };
  } catch (error) {
    if (isZodError(error)) {
      const invalidParams = error.errors.map((value) => ({
        name: value.path[0],
        reason: value.message,
      }));

      if (isInvalidParams(invalidParams)) {
        return { isValidate: false, invalidParams };
      }
    }

    throw error instanceof Error
      ? new Error(error.message)
      : new Error('failed to validation');
  }
};
