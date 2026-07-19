import { describe, expect, it } from "vitest";
import { switchLanguageInAppPath } from "@/functions/language";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

describe("src/functions/language.ts switchLanguageInAppPath TestCases", () => {
  interface TestTable {
    readonly appPath: IncludeLanguageAppPath;
    readonly expected: IncludeLanguageAppPath;
    readonly language: Language;
  }

  it.each`
    appPath         | language | expected
    ${"/"}          | ${"ja"}  | ${"/"}
    ${"/"}          | ${"en"}  | ${"/en"}
    ${"/en"}        | ${"ja"}  | ${"/"}
    ${"/en"}        | ${"en"}  | ${"/en"}
    ${"/upload"}    | ${"ja"}  | ${"/upload"}
    ${"/upload"}    | ${"en"}  | ${"/en/upload"}
    ${"/en/upload"} | ${"ja"}  | ${"/upload"}
    ${"/en/upload"} | ${"en"}  | ${"/en/upload"}
    ${"/ja/upload"} | ${"en"}  | ${"/en/upload"}
    ${"/ja"}        | ${"ja"}  | ${"/"}
  `(
    "should return $expected when appPath is $appPath and language is $language",
    ({ appPath, language, expected }: TestTable) => {
      expect(switchLanguageInAppPath(appPath, language)).toStrictEqual(
        expected
      );
    }
  );
});
