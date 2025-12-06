// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { validateUploadFile } from "../upload-validator";

describe("validateUploadFile", () => {
  describe("許可されたファイル", () => {
    it("PNGファイルは許可される", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });

    it("JPEGファイルは許可される", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe("許可されないファイル", () => {
    it("GIFファイルは許可されない", () => {
      const file = new File(["test"], "test.gif", { type: "image/gif" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe("invalid_extension");
        expect(result.fileType).toBe("gif");
      }
    });

    it("WebPファイルは許可されない", () => {
      const file = new File(["test"], "test.webp", { type: "image/webp" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe("invalid_extension");
      }
    });

    it("MIMEタイプが許可されていても拡張子が不正なら許可されない", () => {
      // 例: MIMEはimage/pngだが拡張子が.gif
      const file = new File(["test"], "test.gif", { type: "image/png" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe("invalid_extension");
        expect(result.fileType).toBe("gif");
      }
    });
  });

  describe("ファイルサイズ", () => {
    it("5MB以下のファイルは許可される", () => {
      const content = new Uint8Array(5 * 1024 * 1024); // 5MB
      const file = new File([content], "test.png", { type: "image/png" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });

    it("5MBを超えるファイルは許可されない", () => {
      const content = new Uint8Array(5 * 1024 * 1024 + 1); // 5MB + 1byte
      const file = new File([content], "test.png", { type: "image/png" });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe("file_too_large");
      }
    });
  });
});
