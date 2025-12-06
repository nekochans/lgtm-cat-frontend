// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadForm } from "../upload-form";

describe("UploadForm", () => {
  afterEach(() => {
    cleanup();
  });

  describe("日本語表示", () => {
    it("ドロップエリアのテキストが日本語で表示される", () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText("ここに画像をドロップ")).toBeInTheDocument();
      expect(screen.getByText("またはファイルの選択")).toBeInTheDocument();
    });

    it("注意事項が日本語で表示される", () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText("注意事項")).toBeInTheDocument();
      expect(
        screen.getByText(
          "拡張子が png, jpg, jpeg の画像のみアップロード出来ます。"
        )
      ).toBeInTheDocument();
    });
  });

  describe("英語表示", () => {
    it("ドロップエリアのテキストが英語で表示される", () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText("Drop image here")).toBeInTheDocument();
      expect(screen.getByText("Select an image file")).toBeInTheDocument();
    });

    it("注意事項が英語で表示される", () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText("Precautions")).toBeInTheDocument();
      expect(
        screen.getByText("png, jpg, jpeg images are available.")
      ).toBeInTheDocument();
    });
  });
});
