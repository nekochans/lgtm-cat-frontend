import { render, screen } from "@testing-library/react";
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
});
