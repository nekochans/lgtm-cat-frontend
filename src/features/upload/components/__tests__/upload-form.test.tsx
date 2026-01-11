// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadForm } from "../upload-form";

describe("src/features/upload/components/upload-form.tsx UploadForm TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display drop area text in Japanese when language is ja", () => {
    render(<UploadForm language="ja" />);

    expect(screen.getByText("ここに画像をドロップ")).toBeInTheDocument();
    expect(screen.getByText("またはファイルの選択")).toBeInTheDocument();
  });

  it("should display precautions in Japanese when language is ja", () => {
    render(<UploadForm language="ja" />);

    expect(screen.getByText("注意事項")).toBeInTheDocument();
    expect(
      screen.getByText(
        "拡張子が png, jpg, jpeg の画像のみアップロード出来ます。"
      )
    ).toBeInTheDocument();
  });

  it("should display drop area text in English when language is en", () => {
    render(<UploadForm language="en" />);

    expect(screen.getByText("Drop image here")).toBeInTheDocument();
    expect(screen.getByText("Select an image file")).toBeInTheDocument();
  });

  it("should display precautions in English when language is en", () => {
    render(<UploadForm language="en" />);

    expect(screen.getByText("Precautions")).toBeInTheDocument();
    expect(
      screen.getByText("png, jpg, jpeg images are available.")
    ).toBeInTheDocument();
  });
});
