// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";

vi.mock("@/features/url", () => ({
  appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
}));

describe("src/features/main/functions/generate-lgtm-markdown.ts generateLgtmMarkdown TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate markdown with correct format", () => {
    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/test.webp"
    );

    const result = generateLgtmMarkdown(imageUrl);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/test.webp)](https://lgtmeow.com)"
    );
  });

  it("should use appBaseUrl for the link destination", async () => {
    const { appBaseUrl } = await import("@/features/url");
    vi.mocked(appBaseUrl).mockReturnValue("https://example.com");

    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/another.webp"
    );

    const result = generateLgtmMarkdown(imageUrl);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/another.webp)](https://example.com)"
    );
    expect(appBaseUrl).toHaveBeenCalled();
  });
});
