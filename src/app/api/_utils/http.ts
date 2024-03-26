import { httpStatusCode } from '@/constants';
import { NextResponse } from 'next/server';

const tooManyRequestsResponseBody = {
  type: 'TOO_MANY_REQUESTS',
  title: 'Too many requests.',
  detail: 'Too many requests from this IP. Please try again after some time.',
} as const;

export const createTooManyRequestsError = (): NextResponse<
  typeof tooManyRequestsResponseBody
> => {
  const responseBody = {
    type: 'TOO_MANY_REQUESTS',
    title: 'Too many requests.',
    detail: 'Too many requests from this IP. Please try again after some time.',
  } as const;

  const status = httpStatusCode.tooManyRequests;

  return NextResponse.json(responseBody, { status });
};
