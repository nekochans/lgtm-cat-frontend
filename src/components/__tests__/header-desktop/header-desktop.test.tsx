import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HeaderDesktop } from "@/components/header-desktop";

describe("src/components/header-desktop.tsx HeaderDesktop TestCases", () => {
  it("should link to English login with current path when logged out", () => {
    render(
      <HeaderDesktop
        currentUrlPath="/en/upload"
        isLoggedIn={false}
        language="en"
      />
    );

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });

  it("should retain return path on login page when logged out", () => {
    render(
      <HeaderDesktop
        currentUrlPath="/en/login"
        isLoggedIn={false}
        language="en"
        loginReturnTo="/en/upload"
      />
    );

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });

  it("should switch language by pathname only when languageSwitchHrefs is not provided", async () => {
    const user = userEvent.setup();

    render(
      <HeaderDesktop
        currentUrlPath="/en/upload"
        isLoggedIn={false}
        language="en"
      />
    );

    await user.click(screen.getByRole("button", { name: "language" }));

    expect((await screen.findByText("日本語")).closest("a")).toHaveAttribute(
      "href",
      "/upload"
    );
    expect((await screen.findByText("English")).closest("a")).toHaveAttribute(
      "href",
      "/en/upload"
    );
  });

  it("should use languageSwitchHrefs for language links when provided", async () => {
    const user = userEvent.setup();

    render(
      <HeaderDesktop
        currentUrlPath="/en/login"
        isLoggedIn={false}
        language="en"
        languageSwitchHrefs={{
          ja: "/login?returnTo=%2Fupload&error=signin_failed",
          en: "/en/login?returnTo=%2Fen%2Fupload&error=signin_failed",
        }}
        loginReturnTo="/en/upload"
      />
    );

    await user.click(screen.getByRole("button", { name: "language" }));

    expect((await screen.findByText("日本語")).closest("a")).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fupload&error=signin_failed"
    );
    expect((await screen.findByText("English")).closest("a")).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload&error=signin_failed"
    );
  });
});
