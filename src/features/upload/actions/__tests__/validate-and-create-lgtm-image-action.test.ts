// 絶対厳守：編集前に必ずAI実装ルールを読む

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { mockCreateLgtmImageError } from "@/mocks/api/external/lgtmeow/mock-create-lgtm-image-error";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockIsAcceptableCatImagePayloadTooLargeError } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error";
import { validateAndCreateLgtmImageAction } from "../validate-and-create-lgtm-image-action";

// Mock next/cache (revalidateTag is used in Server Action)
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// Mock Cognito authentication
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(() =>
    Promise.resolve("mock-access-token")
  ),
}));

// Mock R2 client
vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedGetUrl: vi.fn(() =>
    Promise.resolve({
      getUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
    })
  ),
}));

// API base URL (from environment variables)
const apiBaseUrl = lgtmeowApiUrl();

// Mock successful LGTM image creation (returns imageUrl)
const mockCreateLgtmImageSuccess = () =>
  HttpResponse.json(
    {
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp",
    },
    { status: httpStatusCode.accepted, statusText: "Accepted" }
  );

const server = setupServer(
  http.post(`${apiBaseUrl}/cat-images/validate/url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageSuccess)
);

describe("src/features/upload/actions/validate-and-create-lgtm-image-action.ts validateAndCreateLgtmImageAction TestCases", () => {
  const testObjectKey = "uploads/test-uuid.jpg";

  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => server.close());

  it("should return createdLgtmImageUrl when successful", async () => {
    const result = await validateAndCreateLgtmImageAction(testObjectKey, "ja");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.createdLgtmImageUrl).toContain(
        "https://lgtm-images.lgtmeow.com"
      );
    }
  });

  it("should return error message when image is not a cat", async () => {
    server.use(
      http.post(
        `${apiBaseUrl}/cat-images/validate/url`,
        mockIsAcceptableCatImageNotCatImage
      )
    );

    const result = await validateAndCreateLgtmImageAction(testObjectKey, "ja");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("猫");
    }
  });

  it("should return error message when API returns PayloadTooLarge error", async () => {
    server.use(
      http.post(
        `${apiBaseUrl}/cat-images/validate/url`,
        mockIsAcceptableCatImagePayloadTooLargeError
      )
    );

    const result = await validateAndCreateLgtmImageAction(testObjectKey, "ja");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("サイズ");
    }
  });

  it("should return error message when LGTM image creation API returns non-202", async () => {
    server.use(
      http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageError)
    );

    const result = await validateAndCreateLgtmImageAction(testObjectKey, "ja");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("エラー");
    }
  });
});
