// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import { UploadSuccess } from "../upload-success";

const testLgtmImageUrl = createLgtmImageUrl(
  "https://lgtm-images.lgtmeow.com/test.webp"
);

// happy-dom環境ではnavigator.clipboardが存在しないため、グローバルにモックを設定
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

describe("UploadSuccess", () => {
  afterEach(() => {
    cleanup();
  });

  describe("日本語表示", () => {
    it("成功メッセージが日本語で表示される", () => {
      render(
        <UploadSuccess
          language="ja"
          lgtmImageUrl={testLgtmImageUrl}
          onClose={vi.fn()}
          previewImageUrl="blob:http://localhost/test-image"
        />
      );

      expect(
        screen.getByText("アップロード成功しました！")
      ).toBeInTheDocument();
    });

    it("ボタンテキストが日本語で表示される", () => {
      render(
        <UploadSuccess
          language="ja"
          lgtmImageUrl={testLgtmImageUrl}
          onClose={vi.fn()}
          previewImageUrl="blob:http://localhost/test-image"
        />
      );

      expect(
        screen.getByRole("button", { name: "閉じる" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Markdownソースをコピー" })
      ).toBeInTheDocument();
    });

    it("最新画像へのリンクが日本語で表示される", () => {
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
  });

  describe("英語表示", () => {
    it("成功メッセージが英語で表示される", () => {
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

    it("ボタンテキストが英語で表示される", () => {
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

    it("最新画像へのリンクが英語で表示される", () => {
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
  });

  describe("閉じるボタン動作", () => {
    it("閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
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
  });

  describe("コピー機能", () => {
    it("コピーボタンをクリックするとCopied!メッセージが表示される", async () => {
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

      // Copied!メッセージが表示されることでクリップボードへのコピーが成功したことを確認
      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });

    it("画像クリックでもCopied!メッセージが表示される", async () => {
      const user = userEvent.setup();

      render(
        <UploadSuccess
          language="ja"
          lgtmImageUrl={testLgtmImageUrl}
          onClose={vi.fn()}
          previewImageUrl="blob:http://localhost/test-image"
        />
      );

      // 画像をラップしているbuttonをクリック
      const imageButton = screen.getByRole("button", {
        name: "Uploaded LGTM image",
      });
      await user.click(imageButton);

      // Copied!メッセージが表示されることでクリップボードへのコピーが成功したことを確認
      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });
  });
});
