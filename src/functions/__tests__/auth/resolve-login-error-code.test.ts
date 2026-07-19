import { describe, expect, it } from "vitest";
import { resolveLoginErrorCode } from "@/functions/auth";

describe("src/functions/auth.ts resolveLoginErrorCode TestCases", () => {
  interface TestTable {
    readonly error: unknown;
    readonly expected: string | undefined;
  }

  it.each`
    error                                | expected
    ${"access_denied"}                   | ${"access_denied"}
    ${""}                                | ${""}
    ${["access_denied", "server_error"]} | ${"access_denied"}
    ${[]}                                | ${undefined}
    ${[123]}                             | ${undefined}
    ${undefined}                         | ${undefined}
    ${null}                              | ${undefined}
    ${123}                               | ${undefined}
  `(
    "should return $expected when error is $error",
    ({ error, expected }: TestTable) => {
      expect(resolveLoginErrorCode(error)).toStrictEqual(expected);
    }
  );
});
