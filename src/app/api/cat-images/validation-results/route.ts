import { issueClientCredentialsAccessToken } from '@/api';
import {
  httpStatusCode,
  upstashRedisRestToken,
  upstashRedisRestUrl,
} from '@/constants';
import {
  acceptedTypesImageExtensions,
  FetchLgtmImagesError,
  imageRecognitionApiUrl,
  isAcceptableCatImageNotAcceptableReasons,
  validation,
  type IsAcceptableCatImageResponse,
  type ValidationResult,
} from '@/features';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const redis = new Redis({
  url: upstashRedisRestUrl(),
  token: upstashRedisRestToken(),
});

const rateLimit = new Ratelimit({
  redis,
  analytics: true,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  prefix: '@upstash/ratelimit',
});

const schema = z.object({
  image: z.string().min(1),
  imageExtension: z.enum(acceptedTypesImageExtensions),
});

type CatImageValidationRequestBody = z.infer<typeof schema>;

const validateCatImageValidationRequestBody = (
  value: unknown,
): ValidationResult => {
  return validation(schema, value);
};

const isAcceptableCatImageResponseSchema = z.object({
  isAcceptableCatImage: z.boolean(),
  notAcceptableReason: z
    .enum(isAcceptableCatImageNotAcceptableReasons)
    .optional(),
});

const isAcceptableCatImageResponse = (
  value: unknown,
): value is IsAcceptableCatImageResponse => {
  return validation(isAcceptableCatImageResponseSchema, value).isValidate;
};

export const POST = async (request: NextRequest): Promise<Response> => {
  const { success } = await rateLimit.limit(request.ip ?? 'anonymous');
  if (!success) {
    const responseBody = {
      type: 'TOO_MANY_REQUESTS',
      title: 'Too many requests.',
      detail:
        'Too many requests from this IP. Please try again after some time.',
    };

    const status = httpStatusCode.tooManyRequests;

    return NextResponse.json(responseBody, { status });
  }

  const requestBody = (await request.json()) as CatImageValidationRequestBody;
  const validationResult = validateCatImageValidationRequestBody(requestBody);
  if (!validationResult.isValidate && validationResult.invalidParams) {
    const validationErrorBody = {
      title: 'unprocessable entity',
      type: 'ValidationError',
      status: httpStatusCode.unprocessableEntity,
      invalidParams: validationResult.invalidParams,
    } as const;

    return NextResponse.json(validationErrorBody, {
      status: httpStatusCode.unprocessableEntity,
      statusText: 'Unprocessable Entity',
    });
  }

  const accessToken = await issueClientCredentialsAccessToken();

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(
    `${imageRecognitionApiUrl()}/cat-images/validation-results`,
    options,
  );

  const responseBody = (await response.json()) as unknown;
  if (isAcceptableCatImageResponse(responseBody)) {
    return NextResponse.json(responseBody, {
      status: httpStatusCode.ok,
      statusText: 'OK',
    });
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  throw new FetchLgtmImagesError(
    `src/app/api/cat-images/validation-results/route.ts response body is invalid ${response.status} ${response.statusText}`,
    {
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      responseBody,
    },
  );
};
