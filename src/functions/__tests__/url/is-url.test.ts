import { describe, expect, it } from "vitest";
import { isUrl } from "@/functions/url";

describe("src/functions/url.ts isUrl TestCases", () => {
  interface TestTable {
    readonly expected: boolean;
    readonly value: unknown;
  }

  it.each`
    value                         | expected
    ${"https://lgtmeow.com"}      | ${true}
    ${"https://example.com/path"} | ${true}
    ${"http://localhost:3000"}    | ${true}
    ${"http://localhost"}         | ${true}
    ${"http://example.com"}       | ${false}
    ${"ftp://example.com"}        | ${false}
    ${""}                         | ${false}
    ${null}                       | ${false}
    ${undefined}                  | ${false}
    ${123}                        | ${false}
    ${"not-a-url"}                | ${false}
  `(
    "should return $expected when value is $value",
    ({ value, expected }: TestTable) => {
      expect(isUrl(value)).toBe(expected);
    }
  );
});
