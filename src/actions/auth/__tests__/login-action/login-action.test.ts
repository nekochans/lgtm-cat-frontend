import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/actions/auth/login-action";

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

describe("src/actions/auth/login-action.ts loginAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInSocial.mockResolvedValue({
      url: "https://github.com/login/oauth/authorize?client_id=xxx",
      redirect: true,
    });
  });

  it("should call signInSocial with Japanese callback URLs and redirect to GitHub when language is ja", async () => {
    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

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
    await expect(loginAction("en")).rejects.toThrow("NEXT_REDIRECT");

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

  it("should use Japanese return path for callback and error callback", async () => {
    await expect(loginAction("ja", "/upload")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/upload",
        errorCallbackURL: "/login?returnTo=%2Fupload",
      },
    });
  });

  it("should use English return path for callback and error callback", async () => {
    await expect(loginAction("en", "/en/upload")).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/en/upload",
        errorCallbackURL: "/en/login?returnTo=%2Fen%2Fupload",
      },
    });
  });

  it("should redirect to login page with error query when signInSocial throws", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should redirect to English login page with error query when signInSocial throws and language is en", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(loginAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/en/login?error=signin_failed");
  });

  it("should retain return path when signInSocial throws", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(loginAction("en", "/en/upload")).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      "/en/login?returnTo=%2Fen%2Fupload&error=signin_failed"
    );
  });

  it("should redirect to login page with error query when signInSocial returns no url", async () => {
    mockSignInSocial.mockResolvedValue({ redirect: false, url: undefined });

    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should retain return path when signInSocial returns no url", async () => {
    mockSignInSocial.mockResolvedValue({ redirect: false, url: undefined });

    await expect(loginAction("ja", "/upload")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith(
      "/login?returnTo=%2Fupload&error=signin_failed"
    );
  });

  it("should fall back to English home when return path is external", async () => {
    await expect(
      loginAction(
        "en",
        "https://evil.example" as unknown as Parameters<typeof loginAction>[1]
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/en",
        errorCallbackURL: "/en/login",
      },
    });
  });

  it("should fall back to English home when return path language does not match", async () => {
    await expect(loginAction("en", "/upload")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/en",
        errorCallbackURL: "/en/login",
      },
    });
  });

  it("should fall back to Japanese when language is invalid at runtime", async () => {
    await expect(
      loginAction("fr" as unknown as Parameters<typeof loginAction>[0])
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
