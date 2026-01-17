// 絶対厳守：編集前に必ずAI実装ルールを読む
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";

describe("src/components/footer.tsx Footer TestCases", () => {
  it("should display Japanese links when language is ja", () => {
    render(<Footer language="ja" />);

    expect(screen.getByRole("link", { name: "利用規約" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "プライバシーポリシー" })
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "外部送信ポリシー" })).toBeTruthy();
  });

  it("should display English links when language is en", () => {
    render(<Footer language="en" />);

    expect(screen.getByRole("link", { name: "Terms of Use" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "External Transmission Policy" })
    ).toBeTruthy();
  });
});
