import { describe, expect, it } from "vitest";
import { createLoginAppPath } from "@/functions/auth";

describe("src/functions/auth.ts createLoginAppPath TestCases", () => {
  it("should return Japanese login path without query when return path is home", () => {
    expect(createLoginAppPath("ja", { returnTo: "/" })).toBe("/login");
  });

  it("should return English login path without query when options are omitted", () => {
    expect(createLoginAppPath("en")).toBe("/en/login");
  });

  it("should encode Japanese return path in query", () => {
    expect(createLoginAppPath("ja", { returnTo: "/upload" })).toBe(
      "/login?returnTo=%2Fupload"
    );
  });

  it("should encode English return path in query", () => {
    expect(createLoginAppPath("en", { returnTo: "/en/upload" })).toBe(
      "/en/login?returnTo=%2Fen%2Fupload"
    );
  });

  it("should retain return path and error in query", () => {
    expect(
      createLoginAppPath("en", {
        error: "signin_failed",
        returnTo: "/en/upload",
      })
    ).toBe("/en/login?returnTo=%2Fen%2Fupload&error=signin_failed");
  });

  it("should return error query without return path when return path is invalid", () => {
    expect(
      createLoginAppPath("ja", {
        error: "access_denied",
        returnTo: "https://evil.example",
      })
    ).toBe("/login?error=access_denied");
  });
});
