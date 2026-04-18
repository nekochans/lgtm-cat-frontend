// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { mightExtractLanguageFromAppPath } from "@/functions/language";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

describe("src/functions/language.ts mightExtractLanguageFromAppPath TestCases", () => {
  interface TestTable {
    appPath: IncludeLanguageAppPath;
    expected: Language | null;
  }

  it.each`
    appPath         | expected
    ${"/en"}        | ${"en"}
    ${"/ja"}        | ${"ja"}
    ${"/en/upload"} | ${"en"}
    ${"/ja/upload"} | ${"ja"}
    ${"/upload/en"} | ${"en"}
    ${"/upload/ja"} | ${"ja"}
    ${"en/terms"}   | ${null}
  `(
    "should return language. appPath: $appPath",
    ({ appPath, expected }: TestTable) => {
      expect(mightExtractLanguageFromAppPath(appPath)).toStrictEqual(expected);
    }
  );
});
