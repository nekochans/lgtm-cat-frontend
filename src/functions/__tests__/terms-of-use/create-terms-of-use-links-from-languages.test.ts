import { describe, expect, it } from "vitest";
import { createTermsOfUseLinksFromLanguages } from "@/functions/terms-of-use";
import type { Language } from "@/types/language";

describe("src/functions/terms-of-use.ts createTermsOfUseLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText      | expectedLink
    ${"ja"}  | ${"利用規約"}     | ${"/terms"}
    ${"en"}  | ${"Terms of Use"} | ${"/en/terms"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result = createTermsOfUseLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
