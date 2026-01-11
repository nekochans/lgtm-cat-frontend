// 絶対厳守：編集前に必ずAI実装ルールを読む

import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateUploadUrlAction } from "../generate-upload-url-action";

// R2 client mock
const mockGenerateR2PresignedPutUrl = vi.fn();

vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedPutUrl: () => mockGenerateR2PresignedPutUrl(),
}));

describe("src/features/upload/actions/generate-upload-url-action.ts generateUploadUrlAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateR2PresignedPutUrl.mockResolvedValue({
      putUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
      objectKey: "uploads/test-uuid.jpg",
    });
  });

  it("should return presigned PUT URL with valid MIME type and size", async () => {
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

  it("should return error when MIME type is not allowed", async () => {
    const result = await generateUploadUrlAction(
      "image/gif",
      1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("JPEG");
    }
    // R2 call should not be made
    expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
  });

  it("should return error when file size exceeds 5MB", async () => {
    const result = await generateUploadUrlAction(
      "image/jpeg",
      6 * 1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("5MB");
    }
    // R2 call should not be made
    expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
  });

  it("should return error when R2 call fails", async () => {
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
