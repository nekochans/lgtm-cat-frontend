import { beforeEach, describe, expect, it, vi } from "vitest";
import { signinAction } from "@/actions/auth/signin-action";

const mockSignInSocial = vi.fn();

vi.mock("@/lib/better-auth/auth", () => ({
  auth: {
    api: {
      signInSocial: (options: unknown) => mockSignInSocial(options),
    },
  },
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/actions/auth/signin-action.ts signinAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInSocial.mockResolvedValue({
      url: "https://github.com/login/oauth/authorize?client_id=xxx",
      redirect: true,
    });
  });

  it("should call signInSocial with Japanese callback URLs and redirect to GitHub when language is ja", async () => {
    await expect(signinAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/",
        errorCallbackURL: "/login",
      },
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      "https://github.com/login/oauth/authorize?client_id=xxx"
    );
  });

  it("should call signInSocial with English callback URLs and redirect to GitHub when language is en", async () => {
    await expect(signinAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/en",
        errorCallbackURL: "/en/login",
      },
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      "https://github.com/login/oauth/authorize?client_id=xxx"
    );
  });

  it("should redirect to login page with error query when signInSocial throws", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(signinAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should redirect to English login page with error query when signInSocial throws and language is en", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(signinAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/en/login?error=signin_failed");
  });

  it("should redirect to login page with error query when signInSocial returns no url", async () => {
    mockSignInSocial.mockResolvedValue({ redirect: false, url: undefined });

    await expect(signinAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should fall back to Japanese when language is invalid at runtime", async () => {
    await expect(
      signinAction("fr" as unknown as Parameters<typeof signinAction>[0])
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/",
        errorCallbackURL: "/login",
      },
    });
  });
});
