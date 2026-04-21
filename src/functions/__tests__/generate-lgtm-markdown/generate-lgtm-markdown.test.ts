// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { generateLgtmMarkdown } from "@/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/types/lgtm-image";
import type { Url } from "@/types/url";

describe("src/functions/generate-lgtm-markdown.ts generateLgtmMarkdown TestCases", () => {
  it("should generate markdown with correct format", () => {
    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/test.webp"
    );

    const result = generateLgtmMarkdown(imageUrl, "https://lgtmeow.com" as Url);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/test.webp)](https://lgtmeow.com)"
    );
  });

  it("should use appBaseUrl for the link destination", () => {
    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/another.webp"
    );

    const result = generateLgtmMarkdown(imageUrl, "https://example.com" as Url);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/another.webp)](https://example.com)"
    );
  });
});
