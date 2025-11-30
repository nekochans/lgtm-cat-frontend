// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";

// モック設定
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(),
}));

vi.mock("@/features/main/functions/fetch-lgtm-images", () => ({
  fetchLgtmImagesInRandom: vi.fn(),
}));

vi.mock("@/features/url", () => ({
  appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
}));

describe("copyRandomCat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return markdown when images are available", async () => {
    const mockAccessToken = "mock-access-token";
    const mockImages = [
      {
        id: createLgtmImageId(1),
        imageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/test1.webp"
        ),
      },
      {
        id: createLgtmImageId(2),
        imageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/test2.webp"
        ),
      },
    ];

    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    const { fetchLgtmImagesInRandom } = await import(
      "@/features/main/functions/fetch-lgtm-images"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockResolvedValue(
      mockAccessToken as never
    );
    vi.mocked(fetchLgtmImagesInRandom).mockResolvedValue(mockImages);

    // Math.random をモックして特定のインデックスを選択させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await copyRandomCat();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toBe(
        "[![LGTMeow](https://lgtm-images.lgtmeow.com/test1.webp)](https://lgtmeow.com)"
      );
    }
  });

  it("should return error when no images are available", async () => {
    const mockAccessToken = "mock-access-token";

    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    const { fetchLgtmImagesInRandom } = await import(
      "@/features/main/functions/fetch-lgtm-images"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockResolvedValue(
      mockAccessToken as never
    );
    vi.mocked(fetchLgtmImagesInRandom).mockResolvedValue([]);

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No images available");
    }
  });

  it("should return error when API call fails", async () => {
    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockRejectedValue(
      new Error("API Error")
    );

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("API Error");
    }
  });
});
