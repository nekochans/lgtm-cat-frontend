// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { AppPathName } from "@/types/url";

describe("src/functions/url.ts createIncludeLanguageAppPath TestCases", () => {
  interface TestTable {
    readonly appPathName: AppPathName;
    readonly expected: string;
    readonly language: Language;
  }

  it.each`
    appPathName                       | language | expected
    ${"home"}                         | ${"ja"}  | ${"/"}
    ${"home"}                         | ${"en"}  | ${"/en"}
    ${"upload"}                       | ${"ja"}  | ${"/upload"}
    ${"upload"}                       | ${"en"}  | ${"/en/upload"}
    ${"terms"}                        | ${"ja"}  | ${"/terms"}
    ${"terms"}                        | ${"en"}  | ${"/en/terms"}
    ${"privacy"}                      | ${"ja"}  | ${"/privacy"}
    ${"privacy"}                      | ${"en"}  | ${"/en/privacy"}
    ${"docs-how-to-use"}              | ${"ja"}  | ${"/docs/how-to-use"}
    ${"docs-how-to-use"}              | ${"en"}  | ${"/en/docs/how-to-use"}
    ${"external-transmission-policy"} | ${"ja"}  | ${"/external-transmission-policy"}
    ${"external-transmission-policy"} | ${"en"}  | ${"/en/external-transmission-policy"}
  `(
    "should return $expected when appPathName is $appPathName and language is $language",
    ({ appPathName, language, expected }: TestTable) => {
      expect(createIncludeLanguageAppPath(appPathName, language)).toBe(
        expected
      );
    }
  );
});
