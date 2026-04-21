// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { createPrivacyPolicyLinksFromLanguages } from "@/functions/privacy-policy";
import type { Language } from "@/types/language";

describe("src/functions/privacy-policy.ts createPrivacyPolicyLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText              | expectedLink
    ${"ja"}  | ${"プライバシーポリシー"} | ${"/privacy"}
    ${"en"}  | ${"Privacy Policy"}       | ${"/en/privacy"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result = createPrivacyPolicyLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
