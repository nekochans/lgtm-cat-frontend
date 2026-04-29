import { describe, expect, it } from "vitest";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/functions/external-transmission-policy";
import type { Language } from "@/types/language";

describe("src/functions/external-transmission-policy.ts createExternalTransmissionPolicyLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText                      | expectedLink
    ${"ja"}  | ${"外部送信ポリシー"}             | ${"/external-transmission-policy"}
    ${"en"}  | ${"External Transmission Policy"} | ${"/en/external-transmission-policy"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result =
        createExternalTransmissionPolicyLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
