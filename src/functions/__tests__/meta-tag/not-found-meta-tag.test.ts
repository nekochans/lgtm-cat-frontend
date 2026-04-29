import { describe, expect, it } from "vitest";
import { notFoundMetaTag } from "@/functions/meta-tag";
import type { Language } from "@/types/language";
import type { Url } from "@/types/url";

describe("src/functions/meta-tag.ts notFoundMetaTag TestCases", () => {
  const appBaseUrl = "https://lgtmeow.com" as Url;

  interface TestTable {
    readonly expectedTitle: string;
    readonly language: Language;
  }

  it.each`
    language | expectedTitle
    ${"ja"}  | ${"LGTMeow ページが見つかりません"}
    ${"en"}  | ${"LGTMeow Page not found"}
  `(
    "should return correct title when language is $language",
    ({ language, expectedTitle }: TestTable) => {
      const result = notFoundMetaTag(language, appBaseUrl);
      expect(result.title).toBe(expectedTitle);
    }
  );

  it("should return ogpImgUrl containing the base URL", () => {
    const result = notFoundMetaTag("ja", appBaseUrl);
    expect(result.ogpImgUrl).toBe("https://lgtmeow.com/opengraph-image.png");
  });

  it("should return appName as LGTMeow", () => {
    const result = notFoundMetaTag("ja", appBaseUrl);
    expect(result.appName).toBe("LGTMeow");
  });
});
