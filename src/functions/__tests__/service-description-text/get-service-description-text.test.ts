// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { getServiceDescriptionText } from "@/functions/service-description-text";
import type { Language } from "@/types/language";

describe("src/functions/service-description-text.ts getServiceDescriptionText TestCases", () => {
  interface TestTable {
    readonly expectedLine1: string;
    readonly expectedLine2: string;
    readonly language: Language;
  }

  it.each`
    language | expectedLine1                                                   | expectedLine2
    ${"ja"}  | ${"可愛い猫のLGTM画像を作成して共有できるサービスです。"}       | ${"画像をクリックするとGitHub Markdownがコピーされます。"}
    ${"en"}  | ${"A service for generating and sharing cute cat LGTM images."} | ${"Click on an image to copy the GitHub Markdown."}
  `(
    "should return correct description text when language is $language",
    ({ language, expectedLine1, expectedLine2 }: TestTable) => {
      const result = getServiceDescriptionText(language);
      expect(result.line1).toBe(expectedLine1);
      expect(result.line2).toBe(expectedLine2);
    }
  );
});
