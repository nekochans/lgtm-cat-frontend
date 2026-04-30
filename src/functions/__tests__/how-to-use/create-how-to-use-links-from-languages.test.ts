import { describe, expect, it } from "vitest";
import { createHowToUseLinksFromLanguages } from "@/functions/how-to-use";
import type { Language } from "@/types/language";

describe("src/functions/how-to-use.ts createHowToUseLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText    | expectedLink
    ${"ja"}  | ${"使い方"}     | ${"/docs/how-to-use"}
    ${"en"}  | ${"How to Use"} | ${"/en/docs/how-to-use"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result = createHowToUseLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
