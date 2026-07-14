import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireSessionCookie } from "@/features/auth/components/require-session-cookie";

const mockHasSessionCookie = vi.fn();

vi.mock("@/lib/better-auth/session-cookie", () => ({
  hasSessionCookie: () => mockHasSessionCookie(),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

// このテストでは @/lib/better-auth/auth と @/lib/better-auth/session を意図的に
// vi.mock しない。モック無しでテストが成立する事自体が、DB のセッション API に
// 依存していない事の担保になる。
describe("src/features/auth/components/require-session-cookie.tsx RequireSessionCookie TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to Japanese home when session cookie does not exist", async () => {
    mockHasSessionCookie.mockResolvedValue(false);

    await expect(
      RequireSessionCookie({ children: "logout page", language: "ja" })
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should redirect to English home when session cookie does not exist and language is en", async () => {
    mockHasSessionCookie.mockResolvedValue(false);

    await expect(
      RequireSessionCookie({ children: "logout page", language: "en" })
    ).rejects.toThrow("NEXT_REDIRECT:/en");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should render children when session cookie exists", async () => {
    mockHasSessionCookie.mockResolvedValue(true);

    const element = await RequireSessionCookie({
      children: "logout page",
      language: "ja",
    });

    expect(element.props.children).toBe("logout page");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
