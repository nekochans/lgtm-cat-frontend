import { describe, expect, it } from "vitest";
import { isScopeRequestForbidden } from "@/features/auth/functions/oauth-scope-policy";

describe("src/features/auth/functions/oauth-scope-policy.ts isScopeRequestForbidden TestCases", () => {
  interface TestTable {
    readonly expected: boolean;
    readonly path: string;
    readonly requestBody: unknown;
  }

  it.each`
    path                 | requestBody                                         | expected
    ${"/sign-in/social"} | ${{ provider: "github", scopes: ["user:email"] }}   | ${true}
    ${"/sign-in/social"} | ${{ provider: "github", scopes: ["repo", "user"] }} | ${true}
    ${"/sign-in/social"} | ${{ provider: "github", scopes: [] }}               | ${false}
    ${"/sign-in/social"} | ${{ provider: "github" }}                           | ${false}
    ${"/sign-in/social"} | ${null}                                             | ${false}
    ${"/link-social"}    | ${{ provider: "github", scopes: ["user:email"] }}   | ${true}
    ${"/sign-out"}       | ${{ scopes: ["user:email"] }}                       | ${false}
  `(
    "should return $expected when path is $path",
    ({ path, requestBody, expected }: TestTable) => {
      expect(isScopeRequestForbidden(path, requestBody)).toBe(expected);
    }
  );
});
