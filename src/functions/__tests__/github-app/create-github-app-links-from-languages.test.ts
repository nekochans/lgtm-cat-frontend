// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { createGitHubAppLinksFromLanguages } from "@/functions/github-app";
import type { Language } from "@/types/language";

describe("src/functions/github-app.ts createGitHubAppLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText    | expectedLink
    ${"ja"}  | ${"GitHub App"} | ${"/docs/github-app"}
    ${"en"}  | ${"GitHub App"} | ${"/en/docs/github-app"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result = createGitHubAppLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
