import { issueClientCredentialsAccessToken } from '@/api/cognito/openIdConnect';
import {
  FetchLgtmImagesError,
  lgtmeowApiUrl,
  validation,
  type LgtmImage,
  type ValidationResult,
} from '@/features';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

const isFetchLgtmImagesResponseBody = (
  value: unknown,
): value is FetchLgtmImagesResponseBody => {
  return validateFetchLgtmImagesResponseBody(value).isValidate;
};

export const GET = async (): Promise<Response> => {
  const accessToken = await issueClientCredentialsAccessToken();

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(`${lgtmeowApiUrl()}/lgtm-images`, options);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const responseBody = (await response.json()) as unknown;
  if (isFetchLgtmImagesResponseBody(responseBody)) {
    const lgtmImages = responseBody.lgtmImages.map((value) => {
      return {
        id: Number(value.id),
        imageUrl: value.url,
      } as const satisfies LgtmImage;
    });

    return Response.json(lgtmImages);
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  throw new FetchLgtmImagesError(
    `src/app/api/lgtm-images/route.ts response body is invalid ${response.status} ${response.statusText}`,
    {
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      responseBody,
    },
  );
};
