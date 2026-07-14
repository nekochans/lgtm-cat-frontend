import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireLogin } from "@/features/auth/components/require-login";

const mockGetCachedSession = vi.fn();

vi.mock("@/lib/better-auth/session", () => ({
  getCachedSession: () => mockGetCachedSession(),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/features/auth/components/require-login.tsx RequireLogin TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to Japanese home when session does not exist", async () => {
    mockGetCachedSession.mockResolvedValue(null);

    await expect(
      RequireLogin({ children: "protected", language: "ja" })
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should redirect to English home when session does not exist and language is en", async () => {
    mockGetCachedSession.mockResolvedValue(null);

    await expect(
      RequireLogin({ children: "protected", language: "en" })
    ).rejects.toThrow("NEXT_REDIRECT:/en");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should render children when session exists", async () => {
    mockGetCachedSession.mockResolvedValue({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });

    const element = await RequireLogin({
      children: "protected",
      language: "ja",
    });

    expect(element.props.children).toBe("protected");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
