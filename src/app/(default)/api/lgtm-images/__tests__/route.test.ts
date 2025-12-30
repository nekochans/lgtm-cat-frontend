// 絶対厳守：編集前に必ずAI実装ルールを読む

import { captureException } from "@sentry/nextjs";
import { http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { mightSetRequestIdToSentryFromError } from "@/utils/sentry/might-set-request-id-to-sentry-from-error";
import { mockInternalServerError } from "@/mocks/api/error/mock-internal-server-error";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";
import { GET } from "../route";

// Sentry をモック
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  getCurrentScope: vi.fn(() => ({
    setTag: vi.fn(),
  })),
}));

// Cognitoのアクセストークン取得をモック
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(() =>
    Promise.resolve("mock-access-token")
  ),
}));

// mightSetRequestIdToSentryFromError をモック
vi.mock("@/lib/sentry/might-set-request-id-to-sentry-from-error", () => ({
  mightSetRequestIdToSentryFromError: vi.fn(),
}));

const mockHandlers = [
  http.get(fetchLgtmImagesInRandomUrl(), mockFetchLgtmImages),
];

const server = setupServer(...mockHandlers);

describe("src/app/(default)/api/lgtm-images/route.ts GET TestCases", () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("should return LGTM images with correct format when API call succeeds", async () => {
    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody).toHaveLength(9);

    // 最初の画像のフォーマットを確認
    expect(responseBody[0]).toStrictEqual({
      id: 1,
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp",
    });

    // 最後の画像のフォーマットを確認
    expect(responseBody[8]).toStrictEqual({
      id: 9,
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp",
    });

    // 型の確認
    for (const image of responseBody) {
      expect(typeof image.id).toBe("number");
      expect(typeof image.imageUrl).toBe("string");
    }

    // 成功時は mightSetRequestIdToSentryFromError が呼ばれないことを確認
    expect(mightSetRequestIdToSentryFromError).not.toHaveBeenCalled();

    // 成功時は captureException が呼ばれないことを確認
    expect(captureException).not.toHaveBeenCalled();
  });

  it("should return 500 error and send to Sentry when external API returns error", async () => {
    server.use(http.get(fetchLgtmImagesInRandomUrl(), mockInternalServerError));

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toStrictEqual({
      code: 500,
      message: "Internal Server Error",
    });

    // FetchLgtmImagesError の場合は mightSetRequestIdToSentryFromError が呼ばれることを確認
    expect(mightSetRequestIdToSentryFromError).toHaveBeenCalledTimes(1);

    // captureException が呼ばれたことを確認
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it("should return 500 error and send to Sentry when access token retrieval fails", async () => {
    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    vi.mocked(issueClientCredentialsAccessToken).mockRejectedValueOnce(
      new Error("Failed to retrieve access token")
    );

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toStrictEqual({
      code: 500,
      message: "Internal Server Error",
    });

    // 通常の Error の場合は mightSetRequestIdToSentryFromError が呼ばれないことを確認
    expect(mightSetRequestIdToSentryFromError).not.toHaveBeenCalled();

    // captureException が呼ばれたことを確認
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
