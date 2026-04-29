import { describe, expect, it } from "vitest";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import type { Language } from "@/types/language";
import type { OpenGraphLocale } from "@/types/open-graph-locale";

describe("src/functions/open-graph-locale.ts convertLanguageToOpenGraphLocale TestCases", () => {
  interface TestTable {
    readonly expected: OpenGraphLocale;
    readonly language: Language;
  }

  it.each`
    language | expected
    ${"ja"}  | ${"ja_JP"}
    ${"en"}  | ${"en_US"}
  `(
    "should return OpenGraphLocale. language: $language",
    ({ language, expected }: TestTable) => {
      expect(convertLanguageToOpenGraphLocale(language)).toStrictEqual(
        expected
      );
    }
  );
});
