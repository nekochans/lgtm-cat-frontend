import { describe, expect, it } from "vitest";
import { createMcpLinksFromLanguages } from "@/functions/mcp";
import type { Language } from "@/types/language";

describe("src/functions/mcp.ts createMcpLinksFromLanguages TestCases", () => {
  interface TestTable {
    readonly expectedLink: string;
    readonly expectedText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedText | expectedLink
    ${"ja"}  | ${"MCP"}     | ${"/docs/mcp"}
    ${"en"}  | ${"MCP"}     | ${"/en/docs/mcp"}
  `(
    "should return correct link attribute when language is $language",
    ({ language, expectedText, expectedLink }: TestTable) => {
      const result = createMcpLinksFromLanguages(language);
      expect(result.text).toBe(expectedText);
      expect(result.link).toBe(expectedLink);
    }
  );
});
