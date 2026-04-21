// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { getActionButtonText } from "@/functions/service-description-text";
import type { Language } from "@/types/language";

describe("src/functions/service-description-text.ts getActionButtonText TestCases", () => {
  interface TestTable {
    readonly expectedLatestCats: string;
    readonly expectedRandomCopy: string;
    readonly expectedRefreshCats: string;
    readonly language: Language;
  }

  it.each`
    language | expectedRandomCopy   | expectedRefreshCats   | expectedLatestCats
    ${"ja"}  | ${"ランダムコピー"}  | ${"ねこリフレッシュ"} | ${"ねこ新着順"}
    ${"en"}  | ${"Copy Random Cat"} | ${"Refresh Cats"}     | ${"Show Latest Cats"}
  `(
    "should return correct button text when language is $language",
    ({
      language,
      expectedRandomCopy,
      expectedRefreshCats,
      expectedLatestCats,
    }: TestTable) => {
      const result = getActionButtonText(language);
      expect(result.randomCopy).toBe(expectedRandomCopy);
      expect(result.refreshCats).toBe(expectedRefreshCats);
      expect(result.latestCats).toBe(expectedLatestCats);
    }
  );
});
