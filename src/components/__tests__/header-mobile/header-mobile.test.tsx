import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HeaderMobile } from "@/components/header-mobile";

describe("src/components/header-mobile.tsx HeaderMobile TestCases", () => {
  it("should link to English login with current path when logged out", async () => {
    const user = userEvent.setup();

    render(
      <HeaderMobile
        currentUrlPath="/en/upload"
        isLoggedIn={false}
        language="en"
      />
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(await screen.findByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });

  it("should retain return path on login page when logged out", async () => {
    const user = userEvent.setup();

    render(
      <HeaderMobile
        currentUrlPath="/en/login"
        isLoggedIn={false}
        language="en"
        loginReturnTo="/en/upload"
      />
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(await screen.findByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });
});
