// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadProgress } from "../upload-progress";

describe("UploadProgress", () => {
  afterEach(() => {
    cleanup();
  });

  describe("日本語表示", () => {
    it("アップロード中テキストが日本語で表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByText("ただいまアップロード中...")).toBeInTheDocument();
    });

    it("プログレスバーのaria-labelが正しく設定される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        "ただいまアップロード中..."
      );
    });
  });

  describe("英語表示", () => {
    it("アップロード中テキストが英語で表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="en"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByText("Uploading...")).toBeInTheDocument();
    });
  });

  describe("プログレス値", () => {
    it("プログレス0%で正しく表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={0}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0"
      );
    });

    it("プログレス100%で正しく表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={100}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "100"
      );
    });
  });
});
