import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoutContent } from "@/features/auth/components/logout-content";

// unstable_rethrow の契約（Next.js 内部エラーのみ再送出する）を再現するモック。
// NEXT_REDIRECT は digest が "NEXT_REDIRECT" で始まる Error として表現される。
vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
  },
}));

interface RedirectBoundaryProps {
  readonly children: ReactNode;
}

interface RedirectBoundaryState {
  readonly caughtRedirect: boolean;
}

/**
 * 再送出された NEXT_REDIRECT を受け止める境界。
 * 実環境では Next.js のルーターが遷移として処理する部分の代役。
 */
// biome-ignore lint/style/useReactFunctionComponents: React の Error Boundary には class component が必要。
class RedirectBoundary extends Component<
  RedirectBoundaryProps,
  RedirectBoundaryState
> {
  state: RedirectBoundaryState = { caughtRedirect: false };

  static getDerivedStateFromError(): RedirectBoundaryState {
    return { caughtRedirect: true };
  }

  render() {
    if (this.state.caughtRedirect) {
      return <p>redirected</p>;
    }
    return this.props.children;
  }
}

const createRedirectError = (): Error =>
  Object.assign(new Error("NEXT_REDIRECT"), {
    digest: "NEXT_REDIRECT;push;/;307;",
  });

describe("src/features/auth/components/logout-content.tsx LogoutContent TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should not show error message when logoutAction rejects with NEXT_REDIRECT", async () => {
    const redirectingLogoutAction = vi
      .fn()
      .mockRejectedValue(createRedirectError());

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={redirectingLogoutAction} />
      </RedirectBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText("redirected")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        "ログアウトに失敗しました。時間をおいて再度お試しください。"
      )
    ).not.toBeInTheDocument();
  });

  it("should show error message and retry button when logoutAction rejects with an unexpected error", async () => {
    const failingLogoutAction = vi
      .fn()
      .mockRejectedValue(new Error("unexpected failure"));

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={failingLogoutAction} />
      </RedirectBoundary>
    );

    expect(
      await screen.findByText(
        "ログアウトに失敗しました。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("should call logoutAction again when retry button is pressed", async () => {
    const failingLogoutAction = vi
      .fn()
      .mockRejectedValue(new Error("unexpected failure"));
    const user = userEvent.setup();

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={failingLogoutAction} />
      </RedirectBoundary>
    );

    const retryButton = await screen.findByRole("button", {
      name: "再試行",
    });
    await user.click(retryButton);

    await waitFor(() => {
      expect(failingLogoutAction).toHaveBeenCalledTimes(2);
    });
  });
});
