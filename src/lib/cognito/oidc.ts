// 絶対厳守：編集前に必ずAI実装ルールを読む
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { IssueClientCredentialsAccessTokenError } from "@/features/oidc/errors/issue-client-credentials-access-token-error";
import {
  createJwtAccessTokenString,
  type IssueClientCredentialsAccessToken,
} from "@/features/oidc/types/access-token";
import {
  upstashRedisRestToken,
  upstashRedisRestUrl,
} from "@/lib/upstash/constants";

interface CognitoTokenResponseBody {
  readonly access_token: string;
  readonly expires_in: 3600;
  readonly token_type: "Bearer";
}

const cognitoTokenResponseBodySchema = z.object({
  access_token: z.string(),
  expires_in: z.number().min(3600),
  token_type: z.literal("Bearer"),
});

const isCognitoTokenResponseBody = (
  value: unknown
): value is CognitoTokenResponseBody => {
  const result = cognitoTokenResponseBodySchema.safeParse(value);
  return result.success;
};

const cognitoClientId = (): string => {
  if (process.env.COGNITO_CLIENT_ID != null) {
    return process.env.COGNITO_CLIENT_ID;
  }

  throw new IssueClientCredentialsAccessTokenError(
    "COGNITO_CLIENT_ID is not defined"
  );
};

const cognitoClientSecret = (): string => {
  if (process.env.COGNITO_CLIENT_SECRET != null) {
    return process.env.COGNITO_CLIENT_SECRET;
  }

  throw new IssueClientCredentialsAccessTokenError(
    "COGNITO_CLIENT_SECRET is not defined"
  );
};

const cognitoTokenEndpoint = (): string => {
  if (process.env.COGNITO_TOKEN_ENDPOINT != null) {
    return process.env.COGNITO_TOKEN_ENDPOINT;
  }

  throw new IssueClientCredentialsAccessTokenError(
    "COGNITO_TOKEN_ENDPOINT is not defined"
  );
};

export const issueClientCredentialsAccessToken: IssueClientCredentialsAccessToken =
  async () => {
    const redis = new Redis({
      url: upstashRedisRestUrl(),
      token: upstashRedisRestToken(),
    });

    const cachedAccessToken = await redis.get(cognitoClientId());
    if (typeof cachedAccessToken === "string") {
      return createJwtAccessTokenString(cachedAccessToken);
    }

    const authorization = btoa(`${cognitoClientId()}:${cognitoClientSecret()}`);

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "api.lgtmeow/all image-recognition-api.lgtmeow/all",
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authorization}`,
      },
      body: body.toString(),
    };

    try {
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
          }
        );
      }

      const responseBody = (await response.json()) as unknown;

      if (isCognitoTokenResponseBody(responseBody)) {
        await redis.set(cognitoClientId(), responseBody.access_token);
        await redis.expire(cognitoClientId(), 3000);

        return createJwtAccessTokenString(responseBody.access_token);
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      throw new IssueClientCredentialsAccessTokenError(
        "response body is invalid",
        {
          statusCode: response.status,
          statusText: response.statusText,
          headers,
          responseBody,
        }
      );
    } catch (error) {
      if (error instanceof IssueClientCredentialsAccessTokenError) {
        throw error;
      }

      throw new IssueClientCredentialsAccessTokenError(
        `Failed to fetch access token: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: 0,
          statusText: "Network Error",
          headers: {},
          responseBody: error,
        }
      );
    }
  };
