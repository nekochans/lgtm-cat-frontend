// 絶対厳守：編集前に必ずAI実装ルールを読む
import { z } from "zod";
import {
  fetchLgtmImagesInRandomUrl,
  fetchLgtmImagesInRecentlyCreatedUrl,
} from "@/features/main/functions/api-url";
import { isLgtmImageUrl } from "@/features/main/functions/is-lgtm-image-url";
import type {
  FetchLgtmImages,
  LgtmImage,
} from "@/features/main/types/lgtm-image";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";

const NUMERIC_ID_REGEX = /^\d+$/;

/**
 * APIレスポンスのzodスキーマ（.readonly() で readonly 化）
 */
const apiLgtmImageResponseSchema = z
  .object({
    lgtmImages: z
      .array(
        z
          .object({
            id: z.string().refine((val) => NUMERIC_ID_REGEX.test(val), {
              message: "id must be a numeric string",
            }),
            url: z.url().refine(isLgtmImageUrl, {
              message:
                "url must be a valid LGTM image URL (.webp extension and lgtmeow.com domain)",
            }),
          })
          .readonly()
      )
      .readonly(),
  })
  .readonly();

type ApiLgtmImageResponse = z.infer<typeof apiLgtmImageResponseSchema>;

interface FetchLgtmImagesErrorOptions {
  readonly statusCode?: number;
  readonly statusText?: string;
  readonly headers?: Record<string, string>;
  readonly responseBody?: unknown;
}

export class FetchLgtmImagesError extends Error {
  static {
    FetchLgtmImagesError.prototype.name = "FetchLgtmImagesError";
  }

  readonly statusCode: number | undefined;

  readonly statusText: string | undefined;

  readonly headers: Record<string, string> | undefined;

  readonly responseBody: unknown;

  constructor(message = "", options: FetchLgtmImagesErrorOptions = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}

function isValidApiLgtmImageResponse(
  apiResponse: unknown
): apiResponse is ApiLgtmImageResponse {
  const result = apiLgtmImageResponseSchema.safeParse(apiResponse);
  return result.success;
}

function convertToLgtmImages(response: ApiLgtmImageResponse): LgtmImage[] {
  return response.lgtmImages.map((item) => ({
    id: createLgtmImageId(Number.parseInt(item.id, 10)),
    imageUrl: createLgtmImageUrl(item.url),
  }));
}

async function parseErrorResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return;
    }
  }
}

function createHeadersRecord(response: Response): Record<string, string> {
  const headersRecord: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headersRecord[key] = value;
  });
  return headersRecord;
}

async function requestLgtmImages(
  endpointUrl: string,
  accessToken: JwtAccessTokenString
): Promise<LgtmImage[]> {
  try {
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorResponseBody = await parseErrorResponseBody(response);
      const headersRecord = createHeadersRecord(response);

      if (response.status === 401) {
        throw new FetchLgtmImagesError("Unauthorized", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      if (response.status === 500) {
        throw new FetchLgtmImagesError("Internal Server Error", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      throw new FetchLgtmImagesError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        }
      );
    }

    const responseBodyRaw: unknown = await response.json().catch(() => {
      const headersRecord = createHeadersRecord(response);
      throw new FetchLgtmImagesError("Invalid API response format", {
        statusCode: response.status,
        statusText: response.statusText,
        headers: headersRecord,
      });
    });

    if (!isValidApiLgtmImageResponse(responseBodyRaw)) {
      const headersRecord = createHeadersRecord(response);
      throw new FetchLgtmImagesError("Invalid API response format", {
        statusCode: response.status,
        statusText: response.statusText,
        headers: headersRecord,
        responseBody: responseBodyRaw,
      });
    }

    return convertToLgtmImages(responseBodyRaw);
  } catch (error) {
    if (error instanceof FetchLgtmImagesError) {
      throw error;
    }

    throw new FetchLgtmImagesError(
      `Failed to fetch LGTM images: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export const fetchLgtmImagesInRandom: FetchLgtmImages = async (
  accessToken: JwtAccessTokenString
): Promise<LgtmImage[]> =>
  requestLgtmImages(fetchLgtmImagesInRandomUrl(), accessToken);

export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (
  accessToken: JwtAccessTokenString
): Promise<LgtmImage[]> =>
  requestLgtmImages(fetchLgtmImagesInRecentlyCreatedUrl(), accessToken);
