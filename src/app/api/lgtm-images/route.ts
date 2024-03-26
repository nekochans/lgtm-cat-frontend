import {
  isFetchLgtmImagesResponseBody,
  issueClientCredentialsAccessToken,
} from '@/api';
import {
  httpStatusCode,
  upstashRedisRestToken,
  upstashRedisRestUrl,
} from '@/constants';
import {
  acceptedTypesImageExtensions,
  FetchLgtmImagesError,
  lgtmeowApiUrl,
  validation,
  type LgtmImage,
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

export const GET = async (request: NextRequest): Promise<Response> => {
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

const uploadLgtmImageRequestBodySchema = z.object({
  image: z.string().min(1),
  imageExtension: z.enum(acceptedTypesImageExtensions),
});

type UploadLgtmImageRequestBody = z.infer<
  typeof uploadLgtmImageRequestBodySchema
>;

const validateUploadLgtmImageRequestBody = (
  value: unknown,
): ValidationResult => {
  return validation(uploadLgtmImageRequestBodySchema, value);
};

export type UploadLgtmImageResponse = {
  imageUrl: `https://${string}`;
};

const uploadLgtmImageResponseSchema = z.object({
  imageUrl: z.string().url(),
});

const isUploadLgtmImageResponse = (
  value: unknown,
): value is UploadLgtmImageResponse => {
  return validation(uploadLgtmImageResponseSchema, value).isValidate;
};

export const POST = async (req: Request): Promise<Response> => {
  const requestBody = (await req.json()) as UploadLgtmImageRequestBody;
  const validationResult = validateUploadLgtmImageRequestBody(requestBody);
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

  const response = await fetch(`${lgtmeowApiUrl()}/lgtm-images`, options);

  const responseBody = (await response.json()) as unknown;
  if (response.status !== httpStatusCode.accepted) {
    if (response.status === httpStatusCode.payloadTooLarge) {
      const problemDetails = {
        title: 'failed to upload lgtm image payload too large',
        type: 'PayloadTooLarge',
        status: httpStatusCode.payloadTooLarge,
      } as const;

      return NextResponse.json(problemDetails, {
        status: httpStatusCode.payloadTooLarge,
        statusText: 'Payload Too Large',
      });
    }
  }

  if (isUploadLgtmImageResponse(responseBody)) {
    return NextResponse.json(
      {
        createdLgtmImageUrl: responseBody.imageUrl,
      },
      {
        status: httpStatusCode.accepted,
        statusText: 'Accepted',
      },
    );
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  throw new FetchLgtmImagesError(
    `src/app/api/lgtm-images/route.ts POST response body is invalid ${response.status} ${response.statusText}`,
    {
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      responseBody,
    },
  );
};
