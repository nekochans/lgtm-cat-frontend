import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAnonymous } from "@/features/auth/components/require-anonymous";

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

describe("src/features/auth/components/require-anonymous.tsx RequireAnonymous TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to Japanese home when session exists", async () => {
    mockGetCachedSession.mockResolvedValue({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });

    await expect(
      RequireAnonymous({ children: "login page", language: "ja" })
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should redirect to English home when session exists and language is en", async () => {
    mockGetCachedSession.mockResolvedValue({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });

    await expect(
      RequireAnonymous({ children: "login page", language: "en" })
    ).rejects.toThrow("NEXT_REDIRECT:/en");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should render children when session does not exist", async () => {
    mockGetCachedSession.mockResolvedValue(null);

    const element = await RequireAnonymous({
      children: "login page",
      language: "ja",
    });

    expect(element.props.children).toBe("login page");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
