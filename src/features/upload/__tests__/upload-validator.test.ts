// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { validateUploadFile } from "../functions/upload-validator";

describe("src/features/upload/functions/upload-validator.ts validateUploadFile TestCases", () => {
  it("should allow PNG files", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should allow JPEG files", () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should reject GIF files", () => {
    const file = new File(["test"], "test.gif", { type: "image/gif" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
      expect(result.fileType).toBe("gif");
    }
  });

  it("should reject WebP files", () => {
    const file = new File(["test"], "test.webp", { type: "image/webp" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
    }
  });

  it("should reject files with invalid extension even if MIME type is allowed", () => {
    // Example: MIME is image/png but extension is .gif
    const file = new File(["test"], "test.gif", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
      expect(result.fileType).toBe("gif");
    }
  });

  it("should allow files up to 5MB", () => {
    const content = new Uint8Array(5 * 1024 * 1024); // 5MB
    const file = new File([content], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should reject files larger than 5MB", () => {
    const content = new Uint8Array(5 * 1024 * 1024 + 1); // 5MB + 1byte
    const file = new File([content], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("file_too_large");
    }
  });
});
