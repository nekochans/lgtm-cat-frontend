// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import { UploadSuccess } from "../upload-success";

const testLgtmImageUrl = createLgtmImageUrl(
  "https://lgtm-images.lgtmeow.com/test.webp"
);

// happy-dom does not have navigator.clipboard, so set up a global mock
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

describe("src/features/upload/components/upload-success.tsx UploadSuccess TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display success message in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByText("アップロード成功しました！")).toBeInTheDocument();
  });

  it("should display button text in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Markdownソースをコピー" })
    ).toBeInTheDocument();
  });

  it("should display link to latest images in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    const link = screen.getByRole("link", { name: "こちら" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/?view=latest");
  });

  it("should display success message in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByText("Upload successful!")).toBeInTheDocument();
  });

  it("should display button text in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Markdown Source" })
    ).toBeInTheDocument();
  });

  it("should display link to latest images in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    const link = screen.getByRole("link", { name: "here" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en?view=latest");
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={onClose}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should display Copied! message when copy button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Markdownソースをコピー" })
    );

    // Copied! message confirms clipboard copy was successful
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  it("should display Copied! message when image is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    // Click the button wrapping the image
    const imageButton = screen.getByRole("button", {
      name: "Uploaded LGTM image",
    });
    await user.click(imageButton);

    // Copied! message confirms clipboard copy was successful
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});
