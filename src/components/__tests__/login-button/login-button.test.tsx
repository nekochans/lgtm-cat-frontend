import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginButton } from "@/components/login-button";

describe("src/components/login-button.tsx LoginButton TestCases", () => {
  it("should link to Japanese login with current path", () => {
    render(<LoginButton currentUrlPath="/upload" language="ja" />);

    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fupload"
    );
  });

  it("should link to English login with current path", () => {
    render(<LoginButton currentUrlPath="/en/upload" language="en" />);

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });
});
