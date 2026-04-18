// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { errorMetaTag } from "@/functions/meta-tag";
import type { Language } from "@/types/language";
import type { Url } from "@/types/url";

describe("src/functions/meta-tag.ts errorMetaTag TestCases", () => {
  const appBaseUrl = "https://lgtmeow.com" as Url;

  interface TestTable {
    readonly expectedTitle: string;
    readonly language: Language;
  }

  it.each`
    language | expectedTitle
    ${"ja"}  | ${"LGTMeow エラー"}
    ${"en"}  | ${"LGTMeow Error"}
  `(
    "should return correct title when language is $language",
    ({ language, expectedTitle }: TestTable) => {
      const result = errorMetaTag(language, appBaseUrl);
      expect(result.title).toBe(expectedTitle);
    }
  );

  it("should return ogpImgUrl containing the base URL", () => {
    const result = errorMetaTag("ja", appBaseUrl);
    expect(result.ogpImgUrl).toBe("https://lgtmeow.com/opengraph-image.png");
  });

  it("should return appName as LGTMeow", () => {
    const result = errorMetaTag("ja", appBaseUrl);
    expect(result.appName).toBe("LGTMeow");
  });
});
