// 絶対厳守：編集前に必ずAI実装ルールを読む

import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateUploadUrlAction } from "../generate-upload-url-action";

// R2クライアントのモック
const mockGenerateR2PresignedPutUrl = vi.fn();

vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedPutUrl: () => mockGenerateR2PresignedPutUrl(),
}));

describe("generateUploadUrlAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateR2PresignedPutUrl.mockResolvedValue({
      putUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
      objectKey: "uploads/test-uuid.jpg",
    });
  });

  describe("正常系", () => {
    it("有効なMIMEタイプとサイズで署名付きPUT URLを返す", async () => {
      const result = await generateUploadUrlAction(
        "image/jpeg",
        1024 * 1024,
        "ja"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.presignedPutUrl).toContain("https://r2.example.com");
        expect(result.objectKey).toBe("uploads/test-uuid.jpg");
      }
    });
  });

  describe("異常系 - 前検証", () => {
    it("MIMEタイプが許可されていない場合、エラーを返す", async () => {
      const result = await generateUploadUrlAction(
        "image/gif",
        1024 * 1024,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("JPEG");
      }
      // R2への呼び出しは行われない
      expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
    });

    it("ファイルサイズが5MBを超える場合、エラーを返す", async () => {
      const result = await generateUploadUrlAction(
        "image/jpeg",
        6 * 1024 * 1024,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("5MB");
      }
      // R2への呼び出しは行われない
      expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
    });
  });

  describe("異常系 - R2エラー", () => {
    it("R2への呼び出しが失敗した場合、エラーを返す", async () => {
      mockGenerateR2PresignedPutUrl.mockRejectedValue(new Error("R2 error"));

      const result = await generateUploadUrlAction(
        "image/jpeg",
        1024 * 1024,
        "ja"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("エラー");
      }
    });
  });
});
