import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutAction } from "@/actions/auth/logout-action";

const mockSignOut = vi.fn();

vi.mock("@/lib/better-auth/auth", () => ({
  auth: {
    api: {
      signOut: (options: unknown) => mockSignOut(options),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ cookie: "dummy" })),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/actions/auth/logout-action.ts logoutAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ success: true });
  });

  it("should sign out with request headers and redirect to Japanese home when language is ja", async () => {
    await expect(logoutAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignOut).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should sign out and redirect to English home when language is en", async () => {
    await expect(logoutAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should propagate error to caller when signOut throws unexpectedly", async () => {
    mockSignOut.mockRejectedValue(new Error("unexpected failure"));

    await expect(logoutAction("ja")).rejects.toThrow("unexpected failure");

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
