// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { isLgtmImageUrl } from "@/features/main/functions/is-lgtm-image-url";

describe("src/features/main/functions/is-lgtm-image-url.ts isLgtmImageUrl TestCases", () => {
  type TestTable = {
    url: string;
    expected: boolean;
  };

  it.each`
    url                                                                                          | expected
    ${"https://lgtm-images.lgtmeow.com/2025/11/14/11/13ae0652-277b-4369-9bad-37176dc122da.webp"} | ${true}
    ${"https://cdn.lgtmeow.com/images/test.webp"}                                                | ${true}
    ${"https://lgtmeow.com/path/to/image.webp"}                                                  | ${true}
    ${"http://lgtm-images.lgtmeow.com/image.webp"}                                               | ${false}
    ${"https://example.com/image.webp"}                                                          | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.png"}                                               | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.jpg"}                                               | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.jpeg"}                                              | ${false}
    ${"https://lgtm-images.lgtmeow.com/image"}                                                   | ${false}
    ${""}                                                                                        | ${false}
    ${"https://lgtmeow.org/image.webp"}                                                          | ${false}
    ${"https://example.com/lgtmeow.com/image.webp"}                                              | ${false}
    ${"https://lgtmeow.com.evil.org/image.webp"}                                                 | ${false}
    ${"not-a-valid-url"}                                                                         | ${false}
  `(
    "should return $expected when url is $url",
    ({ url, expected }: TestTable) => {
      expect(isLgtmImageUrl(url)).toBe(expected);
    }
  );
});
