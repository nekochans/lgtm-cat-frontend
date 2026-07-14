import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

vi.mock("@/lib/vercel/edge-functions/country", () => ({
  isBanCountry: () => Promise.resolve(false),
}));

vi.mock("@/lib/vercel/edge-functions/maintenance", () => ({
  isInMaintenance: () => Promise.resolve(false),
}));

describe("src/proxy.ts proxy TestCases", () => {
  it("should not reflect cookie and authorization headers in redirect response when ja path is normalized", async () => {
    const request = new NextRequest("http://localhost:2222/ja/upload", {
      headers: {
        authorization: "Bearer dummy-token",
        cookie: "better-auth.session_token=dummy-session-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost:2222/upload"
    );
    expect(response.headers.get("cookie")).toBeNull();
    expect(response.headers.get("authorization")).toBeNull();
  });

  it("should not reflect cookie header in redirect response when /ja is normalized to home", async () => {
    const request = new NextRequest("http://localhost:2222/ja", {
      headers: {
        cookie: "better-auth.session_token=dummy-session-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost:2222/");
    expect(response.headers.get("cookie")).toBeNull();
  });
});
