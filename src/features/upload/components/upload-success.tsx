// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/features/language";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import type { LgtmImageUrl } from "@/features/main/types/lgtm-image";
import { createIncludeLanguageAppPath } from "@/features/url";
import {
  closeButtonText,
  copiedText,
  copyFailedDescription,
  copyFailedTitle,
  copyMarkdownButtonText,
  uploadSuccessDescription,
  uploadSuccessTitle,
  viewLatestImageLinkText,
} from "../functions/upload-i18n";

type Props = {
  readonly language: Language;
  readonly lgtmImageUrl: LgtmImageUrl;
  readonly previewImageUrl: string;
  readonly onClose: () => void;
};

/**
 * アップロード成功画面コンポーネント
 * Figmaデザイン（node-id: 261:6786）に基づく
 */
export function UploadSuccess({
  language,
  lgtmImageUrl,
  previewImageUrl,
  onClose,
}: Props): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const descriptionLines = uploadSuccessDescription(language);
  const linkText = viewLatestImageLinkText(language);
  const viewLatestHref = `${createIncludeLanguageAppPath("home", language)}?view=latest`;

  // クリーンアップ
  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  const handleCopyMarkdown = useCallback(async () => {
    try {
      // Markdownを生成（lgtmImageUrlは既にLgtmImageUrl型）
      const markdown = generateLgtmMarkdown(lgtmImageUrl);

      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);

      // 既存のタイマーをクリア
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }

      // 1.5秒後にコピー状態をリセット
      copyTimerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch {
      addToast({
        title: copyFailedTitle(language),
        description: copyFailedDescription(language),
        color: "danger",
      });
    }
  }, [lgtmImageUrl, language]);

  const handleImageClick = useCallback(() => {
    handleCopyMarkdown();
  }, [handleCopyMarkdown]);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像（クリックでコピー） */}
      <button
        className="relative h-[280px] w-[280px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:h-[371px] md:w-[371px]"
        onClick={handleImageClick}
        type="button"
      >
        <Image
          alt="Uploaded LGTM image"
          className="object-contain"
          fill
          sizes="(max-width: 768px) 280px, 371px"
          src={previewImageUrl}
        />
      </button>

      {/* 成功メッセージ */}
      <p className="px-2 text-center font-bold text-primary text-xl leading-7 md:px-0 md:text-3xl md:leading-9">
        {uploadSuccessTitle(language)}
      </p>

      {/* 説明テキスト - Figma仕様: 20px/line、上下マージンなし */}
      <div className="px-2 text-center font-normal text-sm text-text-br leading-5 md:px-0 md:text-xl md:leading-7">
        {descriptionLines.map((line) =>
          line === "" ? (
            <br key="empty-line-break" />
          ) : (
            <p className="m-0" key={line}>
              {line}
            </p>
          )
        )}
      </div>

      {/* 最新画像へのリンク */}
      <p className="px-2 text-center font-normal text-sm text-text-br leading-5 md:px-0 md:text-xl md:leading-7">
        {linkText.prefix}
        <Link
          className="text-primary underline hover:no-underline"
          href={viewLatestHref}
        >
          {linkText.linkText}
        </Link>
        {linkText.suffix}
      </p>

      {/* ボタンエリア */}
      <div className="flex w-full flex-col items-center justify-center gap-3 px-4 md:w-auto md:flex-row md:gap-5 md:px-0">
        {/* 閉じるボタン - variantを指定せずカスタムクラスのみで制御（HeroUIデフォルトスタイルとの重複回避） */}
        <Button
          className="h-12 w-full rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover md:w-[220px]"
          onPress={onClose}
        >
          {closeButtonText(language)}
        </Button>
        <Button
          className="h-12 w-full rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover md:w-[220px]"
          onPress={handleCopyMarkdown}
        >
          {copyMarkdownButtonText(language)}
        </Button>
      </div>

      {/* Copied! メッセージ - 画面中央に固定表示 */}
      {isCopied ? (
        <div
          aria-live="polite"
          className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 rounded bg-[#7B2F1D] px-6 py-3 font-semibold text-lg text-white shadow-lg"
        >
          {copiedText()}
        </div>
      ) : null}
    </div>
  );
}
