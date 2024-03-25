import { validation, type IssueClientCredentialsAccessToken } from '@/features';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { IssueClientCredentialsAccessTokenError } from './IssueClientCredentialsAccessTokenError';

type CognitoTokenResponseBody = {
  access_token: string;
  // eslint-disable-next-line no-magic-numbers
  expires_in: 3600;
  token_type: 'Bearer';
};

const cognitoTokenResponseBodySchema = z.object({
  access_token: z.string(),
  expires_in: z.number().min(3600),
  token_type: z.literal('Bearer'),
});

const isCognitoTokenResponseBody = (
  value: unknown,
): value is CognitoTokenResponseBody => {
  return validation(cognitoTokenResponseBodySchema, value).isValidate;
};

const cognitoClientId = (): string => {
  if (process.env.COGNITO_CLIENT_ID != null) {
    return process.env.COGNITO_CLIENT_ID;
  }

  throw new IssueClientCredentialsAccessTokenError(
    'COGNITO_CLIENT_ID is not defined',
  );
};

const cognitoClientSecret = (): string => {
  if (process.env.COGNITO_CLIENT_SECRET != null) {
    return process.env.COGNITO_CLIENT_SECRET;
  }

  throw new IssueClientCredentialsAccessTokenError(
    'COGNITO_CLIENT_SECRET is not defined',
  );
};

const cognitoTokenEndpoint = (): string => {
  if (process.env.COGNITO_TOKEN_ENDPOINT != null) {
    return process.env.COGNITO_TOKEN_ENDPOINT;
  }

  throw new IssueClientCredentialsAccessTokenError(
    'COGNITO_TOKEN_ENDPOINT is not defined',
  );
};

const upstashRedisRestUrl = (): string => {
  if (process.env.UPSTASH_REDIS_REST_URL != null) {
    return process.env.UPSTASH_REDIS_REST_URL;
  }

  throw new IssueClientCredentialsAccessTokenError(
    'UPSTASH_REDIS_REST_URL is not defined',
  );
};

const upstashRedisRestToken = (): string => {
  if (process.env.UPSTASH_REDIS_REST_TOKEN != null) {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }

  throw new IssueClientCredentialsAccessTokenError(
    'UPSTASH_REDIS_REST_TOKEN is not defined',
  );
};

export const issueClientCredentialsAccessToken: IssueClientCredentialsAccessToken =
  async () => {
    const redis = new Redis({
      url: upstashRedisRestUrl(),
      token: upstashRedisRestToken(),
    });

    const cachedAccessToken = await redis.get(cognitoClientId());
    if (typeof cachedAccessToken === 'string') {
      return cachedAccessToken;
    }

    const authorization = btoa(`${cognitoClientId()}:${cognitoClientSecret()}`);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorization}`,
      },
      body: 'grant_type=client_credentials&scope=api.lgtmeow/all image-recognition-api.lgtmeow/all',
    };

    const response = await fetch(cognitoTokenEndpoint(), options);
    if (!response.ok) {
      const responseBody = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      throw new IssueClientCredentialsAccessTokenError(
        `failed to issueAccessToken: ${response.status} ${response.statusText}`,
        {
          statusCode: response.status,
          statusText: response.statusText,
          headers,
          responseBody,
        },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const responseBody = (await response.json()) as unknown;

    if (isCognitoTokenResponseBody(responseBody)) {
      await redis.set(cognitoClientId(), responseBody.access_token);
      await redis.expire(cognitoClientId(), 3000);

      return responseBody.access_token;
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    throw new IssueClientCredentialsAccessTokenError(
      'response body is invalid',
      {
        statusCode: response.status,
        statusText: response.statusText,
        headers,
        responseBody,
      },
    );
  };
