import { validation, type ValidationResult } from '@/features';
import { z } from 'zod';

type FetchLgtmImagesResponseBody = {
  lgtmImages: Array<{
    id: string;
    url: `https://${string}`;
  }>;
};

const lgtmImageSchema = z.object({
  id: z.union([z.string().min(1), z.number().min(1)]),
  url: z.string().url(),
});

const fetchLgtmImagesResponseBodySchema = z.object({
  lgtmImages: z.array(lgtmImageSchema),
});

export const validateFetchLgtmImagesResponseBody = (
  value: unknown,
): ValidationResult => {
  return validation(fetchLgtmImagesResponseBodySchema, value);
};

export const isFetchLgtmImagesResponseBody = (
  value: unknown,
): value is FetchLgtmImagesResponseBody => {
  return validateFetchLgtmImagesResponseBody(value).isValidate;
};
