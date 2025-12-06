// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it, vi } from "vitest";
import { mockUpload } from "../mock-upload";

describe("mockUpload", () => {
  it("正常なファイルの場合は成功を返す", async () => {
    const file = new File(["test"], "cat.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.imageUrl).toBe(previewUrl);
    }
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("error.jpgの場合はエラーを返す", async () => {
    const file = new File(["test"], "error.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessage).toBe("upload_error");
    }
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("ERROR.JPG（大文字）の場合もエラーを返す", async () => {
    const file = new File(["test"], "ERROR.JPG", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(false);
  });

  it("プログレスが0から100まで更新される", async () => {
    const file = new File(["test"], "cat.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const progressValues: number[] = [];
    const onProgress = vi.fn((progress: number) => {
      progressValues.push(progress);
    });

    await mockUpload(file, previewUrl, onProgress);

    expect(progressValues[0]).toBe(0);
    expect(progressValues.at(-1)).toBe(100);
    // 中間値も含まれていることを確認
    expect(progressValues.length).toBeGreaterThan(2);
  });
});
