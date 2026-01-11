// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadProgress } from "../upload-progress";

describe("src/features/upload/components/upload-progress.tsx UploadProgress TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display uploading text in Japanese when language is ja", () => {
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

  it("should set correct aria-label for progress bar when language is ja", () => {
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

  it("should display uploading text in English when language is en", () => {
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

  it("should display correctly at 0% progress", () => {
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

  it("should display correctly at 100% progress", () => {
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
