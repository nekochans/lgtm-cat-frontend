// 絶対厳守：編集前に必ずAI実装ルールを読む

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { mockCreateLgtmImageError } from "@/mocks/api/external/lgtmeow/mock-create-lgtm-image-error";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockIsAcceptableCatImagePayloadTooLargeError } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error";
import { validateAndCreateLgtmImageAction } from "../validate-and-create-lgtm-image";

// Cognito認証をモック
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(() =>
    Promise.resolve("mock-access-token")
  ),
}));

// R2クライアントのモック
vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedGetUrl: vi.fn(() =>
    Promise.resolve({
      getUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
    })
  ),
}));

// APIのベースURL（環境変数から取得）
const apiBaseUrl = lgtmeowApiUrl();

// LGTM画像作成成功モック（imageUrlを返す）
const mockCreateLgtmImageSuccess = () =>
  HttpResponse.json(
    {
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp",
    },
    { status: httpStatusCode.accepted, statusText: "Accepted" }
  );

const server = setupServer(
  http.post(`${apiBaseUrl}/cat-images/validate/url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageSuccess)
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("validateAndCreateLgtmImageAction", () => {
  const testObjectKey = "uploads/test-uuid.jpg";

  describe("正常系", () => {
    it("成功した場合、createdLgtmImageUrlを返す", async () => {
      const result = await validateAndCreateLgtmImageAction(
        testObjectKey,
        "ja"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.createdLgtmImageUrl).toContain(
          "https://lgtm-images.lgtmeow.com"
        );
      }
    });
  });

  describe("異常系 - 猫画像判定API", () => {
    it("猫画像でない場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImageNotCatImage
        )
      );

      const result = await validateAndCreateLgtmImageAction(
        testObjectKey,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("猫");
      }
    });

    it("APIからPayloadTooLargeエラーが返る場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(
          `${apiBaseUrl}/cat-images/validate/url`,
          mockIsAcceptableCatImagePayloadTooLargeError
        )
      );

      const result = await validateAndCreateLgtmImageAction(
        testObjectKey,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("サイズ");
      }
    });
  });

  describe("異常系 - LGTM画像作成API失敗", () => {
    it("LGTM画像作成APIが非202を返す場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageError)
      );

      const result = await validateAndCreateLgtmImageAction(
        testObjectKey,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("エラー");
      }
    });
  });
});
