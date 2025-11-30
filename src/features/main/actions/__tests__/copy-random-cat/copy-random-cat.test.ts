// 絶対厳守：編集前に必ずAI実装ルールを読む

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
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { mockIssueClientCredentialsAccessToken } from "@/mocks/api/external/cognito/mock-issue-client-credentials-access-token";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";

// Redis をモック（キャッシュなしを模擬）
vi.mock("@upstash/redis", () => {
  const MockRedis = class {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue("OK");
    expire = vi.fn().mockResolvedValue(1);
  };
  return { Redis: MockRedis };
});

// appBaseUrl をモック（一貫したURLを返すため）
vi.mock("@/features/url", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/url")>();
  return {
    ...actual,
    appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
  };
});

const cognitoTokenEndpoint = process.env.COGNITO_TOKEN_ENDPOINT ?? "";

const mockHandlers = [
  http.post(cognitoTokenEndpoint, mockIssueClientCredentialsAccessToken),
  http.get(fetchLgtmImagesInRandomUrl(), mockFetchLgtmImages),
];

const server = setupServer(...mockHandlers);

describe("copyRandomCat", () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it("should return markdown when images are available", async () => {
    // Math.random をモックして最初の画像を選択させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await copyRandomCat();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toBe(
        "[![LGTMeow](https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp)](https://lgtmeow.com)"
      );
    }
  });

  it("should return error when no images are available", async () => {
    server.use(
      http.get(fetchLgtmImagesInRandomUrl(), () =>
        Response.json({ lgtmImages: [] }, { status: 200 })
      )
    );

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No images available");
    }
  });

  it("should return error when API call fails", async () => {
    server.use(
      http.post(cognitoTokenEndpoint, () =>
        Response.json({ error: "unauthorized" }, { status: 401 })
      )
    );

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("failed to issueAccessToken");
    }
  });
});
