// 絶対厳守：編集前に必ずAI実装ルールを読む

import { http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { fetchLgtmImagesInRecentlyCreatedUrl } from "@/features/main/functions/api-url";
import { fetchLgtmImagesInRecentlyCreated } from "@/features/main/functions/fetch-lgtm-images";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { mockInternalServerError } from "@/mocks/api/error/mock-internal-server-error";
import { mockUnauthorizedError } from "@/mocks/api/error/mock-unauthorized-error";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";

const mockHandlers = [
  http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockFetchLgtmImages),
];

const server = setupServer(...mockHandlers);

describe("src/features/main/functions/fetch-lgtm-images.ts fetchLgtmImagesInRecentlyCreated TestCases", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const dummyAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("should return LGTM images when API call succeeds", async () => {
    const result = await fetchLgtmImagesInRecentlyCreated(dummyAccessToken);

    expect(result).toHaveLength(9);
    expect(result[0]).toStrictEqual({
      id: createLgtmImageId(1),
      imageUrl: createLgtmImageUrl(
        "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp"
      ),
    });
    expect(result[8]).toStrictEqual({
      id: createLgtmImageId(9),
      imageUrl: createLgtmImageUrl(
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp"
      ),
    });
  });

  it("should throw FetchLgtmImagesError when API returns 401 Unauthorized", async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockUnauthorizedError)
    );

    await expect(
      fetchLgtmImagesInRecentlyCreated(dummyAccessToken)
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw FetchLgtmImagesError when API returns 500 Internal Server Error", async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError)
    );

    await expect(
      fetchLgtmImagesInRecentlyCreated(dummyAccessToken)
    ).rejects.toThrow("Internal Server Error");
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid id format", async () => {
    server.use(
      http.get(
        fetchLgtmImagesInRecentlyCreatedUrl(),
        () =>
          new Response(
            JSON.stringify({
              lgtmImages: [
                {
                  id: "abc",
                  url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.webp",
                },
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
      )
    );

    await expect(
      fetchLgtmImagesInRecentlyCreated(dummyAccessToken)
    ).rejects.toThrow("Invalid API response format");
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url extension", async () => {
    server.use(
      http.get(
        fetchLgtmImagesInRecentlyCreatedUrl(),
        () =>
          new Response(
            JSON.stringify({
              lgtmImages: [
                {
                  id: "1",
                  url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.png",
                },
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
      )
    );

    await expect(
      fetchLgtmImagesInRecentlyCreated(dummyAccessToken)
    ).rejects.toThrow("Invalid API response format");
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url domain", async () => {
    server.use(
      http.get(
        fetchLgtmImagesInRecentlyCreatedUrl(),
        () =>
          new Response(
            JSON.stringify({
              lgtmImages: [
                {
                  id: "1",
                  url: "https://evil.com/image.webp",
                },
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
      )
    );

    await expect(
      fetchLgtmImagesInRecentlyCreated(dummyAccessToken)
    ).rejects.toThrow("Invalid API response format");
  });
});
