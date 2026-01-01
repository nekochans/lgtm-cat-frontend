// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import type { Language } from "@/features/language";
import {
  convertLanguageToOpenGraphLocale,
  type OpenGraphLocale,
} from "@/features/open-graph-locale";

describe("src/features/open-graph-locale.ts convertLanguageToOpenGraphLocale TestCases", () => {
  interface TestTable {
    readonly language: Language;
    readonly expected: OpenGraphLocale;
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
