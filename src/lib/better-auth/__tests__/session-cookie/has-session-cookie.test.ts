import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasSessionCookie } from "@/lib/better-auth/session-cookie";

const mockHeaders = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(mockHeaders()),
}));

describe("src/lib/better-auth/session-cookie.ts hasSessionCookie TestCases", () => {
  interface TestTable {
    readonly cookieHeader: string;
    readonly expected: boolean;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    cookieHeader                                    | expected
    ${"better-auth.session_token=abc123"}           | ${true}
    ${"__Secure-better-auth.session_token=abc123"}  | ${true}
    ${"other=value; better-auth.session_token=abc"} | ${true}
    ${"other=value"}                                | ${false}
  `(
    "should return $expected when cookie header is $cookieHeader",
    async ({ cookieHeader, expected }: TestTable) => {
      mockHeaders.mockReturnValue(new Headers({ cookie: cookieHeader }));

      expect(await hasSessionCookie()).toBe(expected);
    }
  );

  it("should return false when cookie header does not exist", async () => {
    mockHeaders.mockReturnValue(new Headers());

    expect(await hasSessionCookie()).toBe(false);
  });
});
