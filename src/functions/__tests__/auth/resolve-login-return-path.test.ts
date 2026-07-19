import { describe, expect, it } from "vitest";
import { resolveLoginReturnPath } from "@/functions/auth";
import type { Language } from "@/types/language";

describe("src/functions/auth.ts resolveLoginReturnPath TestCases", () => {
  interface TestTable {
    readonly expected: string;
    readonly language: Language;
    readonly returnTo: unknown;
  }

  it.each`
    returnTo                              | language | expected
    ${"/"}                                | ${"ja"}  | ${"/"}
    ${"/upload"}                          | ${"ja"}  | ${"/upload"}
    ${"/terms"}                           | ${"ja"}  | ${"/terms"}
    ${"/privacy"}                         | ${"ja"}  | ${"/privacy"}
    ${"/external-transmission-policy"}    | ${"ja"}  | ${"/external-transmission-policy"}
    ${"/favorites"}                       | ${"ja"}  | ${"/favorites"}
    ${"/my-cats"}                         | ${"ja"}  | ${"/my-cats"}
    ${"/docs/how-to-use"}                 | ${"ja"}  | ${"/docs/how-to-use"}
    ${"/docs/mcp"}                        | ${"ja"}  | ${"/docs/mcp"}
    ${"/docs/github-app"}                 | ${"ja"}  | ${"/docs/github-app"}
    ${"/en"}                              | ${"en"}  | ${"/en"}
    ${"/en/upload"}                       | ${"en"}  | ${"/en/upload"}
    ${"/en/terms"}                        | ${"en"}  | ${"/en/terms"}
    ${"/en/privacy"}                      | ${"en"}  | ${"/en/privacy"}
    ${"/en/external-transmission-policy"} | ${"en"}  | ${"/en/external-transmission-policy"}
    ${"/en/favorites"}                    | ${"en"}  | ${"/en/favorites"}
    ${"/en/my-cats"}                      | ${"en"}  | ${"/en/my-cats"}
    ${"/en/docs/how-to-use"}              | ${"en"}  | ${"/en/docs/how-to-use"}
    ${"/en/docs/mcp"}                     | ${"en"}  | ${"/en/docs/mcp"}
    ${"/en/docs/github-app"}              | ${"en"}  | ${"/en/docs/github-app"}
  `(
    "should return $expected when $returnTo is an allowed $language path",
    ({ returnTo, language, expected }: TestTable) => {
      expect(resolveLoginReturnPath(returnTo, language)).toBe(expected);
    }
  );

  it.each`
    returnTo                            | language | expected
    ${undefined}                        | ${"ja"}  | ${"/"}
    ${["/upload"]}                      | ${"ja"}  | ${"/"}
    ${""}                               | ${"ja"}  | ${"/"}
    ${"https://evil.example/upload"}    | ${"ja"}  | ${"/"}
    ${"//evil.example/upload"}          | ${"ja"}  | ${"/"}
    ${"/unknown"}                       | ${"ja"}  | ${"/"}
    ${"/upload?view=latest"}            | ${"ja"}  | ${"/"}
    ${"/upload#preview"}                | ${"ja"}  | ${"/"}
    ${"%2Fupload"}                      | ${"ja"}  | ${"/"}
    ${"/login"}                         | ${"ja"}  | ${"/"}
    ${"/logout"}                        | ${"ja"}  | ${"/"}
    ${"/error"}                         | ${"ja"}  | ${"/"}
    ${"/maintenance"}                   | ${"ja"}  | ${"/"}
    ${"/ja/upload"}                     | ${"ja"}  | ${"/"}
    ${"/en/upload"}                     | ${"ja"}  | ${"/"}
    ${"/upload"}                        | ${"en"}  | ${"/en"}
    ${"https://evil.example/en/upload"} | ${"en"}  | ${"/en"}
    ${"/en/login"}                      | ${"en"}  | ${"/en"}
    ${"/en/logout"}                     | ${"en"}  | ${"/en"}
    ${"/en/error"}                      | ${"en"}  | ${"/en"}
    ${"/en/maintenance"}                | ${"en"}  | ${"/en"}
  `(
    "should return $expected when $returnTo is not an allowed $language path",
    ({ returnTo, language, expected }: TestTable) => {
      expect(resolveLoginReturnPath(returnTo, language)).toBe(expected);
    }
  );
});
