import { describe, expect, it } from "vitest";
import { hasNonEmptyAccountScope } from "@/features/auth/functions/oauth-scope-policy";

describe("src/features/auth/functions/oauth-scope-policy.ts hasNonEmptyAccountScope TestCases", () => {
  interface TestTable {
    readonly expected: boolean;
    readonly scope: string | null | undefined;
  }

  it.each`
    scope                     | expected
    ${"read:user"}            | ${true}
    ${"read:user,user:email"} | ${true}
    ${" "}                    | ${false}
    ${""}                     | ${false}
    ${null}                   | ${false}
    ${undefined}              | ${false}
  `(
    "should return $expected when scope is $scope",
    ({ scope, expected }: TestTable) => {
      expect(hasNonEmptyAccountScope(scope)).toBe(expected);
    }
  );
});
