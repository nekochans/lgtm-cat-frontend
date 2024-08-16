import {
  isFetchLgtmImagesResponseBody,
  issueClientCredentialsAccessToken,
} from '@/api';
import { createTooManyRequestsError } from '@/app/api/_utils/http';
import {
  httpStatusCode,
  upstashRedisRestToken,
  upstashRedisRestUrl,
} from '@/constants';
import {
  FetchLgtmImagesError,
  lgtmeowApiUrl,
  type LgtmImage,
} from '@/features';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';

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
    return createTooManyRequestsError();
  }

  const accessToken = await issueClientCredentialsAccessToken();

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(
    `${lgtmeowApiUrl()}/lgtm-images/recently-created`,
    options,
  );

  const responseBody = (await response.json()) as unknown;
  if (isFetchLgtmImagesResponseBody(responseBody)) {
    const lgtmImages = responseBody.lgtmImages.map((value) => {
      return {
        id: Number(value.id),
        imageUrl: value.url,
      } as const satisfies LgtmImage;
    });

    const status = httpStatusCode.ok;

    return NextResponse.json(lgtmImages, { status });
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  throw new FetchLgtmImagesError(
    `src/app/api/lgtm-images/recently-created/route.ts response body is invalid ${response.status} ${response.statusText}`,
    {
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      responseBody,
    },
  );
};
