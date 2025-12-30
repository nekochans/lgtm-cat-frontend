// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtm-image";
import {
  sendCopyMarkdownFromCopyButton,
  sendCopyMarkdownFromTopImages,
} from "@/utils/gtm";

type Props = {
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon Propsを削除する
  readonly hideHeartIcon?: boolean;
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};

export function LgtmImage({ hideHeartIcon, id, imageUrl }: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCopyActive, setIsCopyActive] = useState(false);
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);

  /**
   * マークダウンをクリップボードにコピーし、GAイベントを送信する共通処理
   * @param sendGaEvent GAイベント送信関数
   */
  const copyMarkdownAndSendEvent = useCallback(
    (sendGaEvent: () => void) => {
      const markdown = generateLgtmMarkdown(imageUrl);
      navigator.clipboard.writeText(markdown);
      setIsCopied(true);

      // GAイベント送信
      sendGaEvent();

      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    },
    [imageUrl]
  );

  // 画像クリック時のハンドラ
  const handleCopy = useCallback(() => {
    copyMarkdownAndSendEvent(sendCopyMarkdownFromTopImages);
  }, [copyMarkdownAndSendEvent]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((previous) => !previous);
  }, []);

  // コピーアイコンクリック時のハンドラ
  const handleCopyIconPress = useCallback(() => {
    copyMarkdownAndSendEvent(sendCopyMarkdownFromCopyButton);
  }, [copyMarkdownAndSendEvent]);

  const handleCopyPressStart = useCallback(() => {
    setIsCopyActive(true);
  }, []);

  const handleCopyPressEnd = useCallback(() => {
    setIsCopyActive(false);
  }, []);

  const handleFavoritePressStart = useCallback(() => {
    setIsFavoriteActive(true);
  }, []);

  const handleFavoritePressEnd = useCallback(() => {
    setIsFavoriteActive(false);
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  return (
    <div
      className="group relative w-full max-w-[390px] flex-none overflow-hidden rounded-lg"
      data-lgtm-image-id={id}
    >
      <button
        aria-label="Copy LGTM markdown"
        className="relative block h-[220px] w-full max-w-[390px] flex-none cursor-pointer border-0 bg-background p-0 dark:bg-neutral-900"
        onClick={handleCopy}
        type="button"
      >
        <Image
          alt="LGTM image"
          className="object-contain"
          fill
          objectPosition="center top"
          priority={false}
          sizes="(max-width: 768px) 100vw, 390px"
          src={imageUrl}
        />
      </button>
      <div className="absolute top-2 right-2 flex gap-2 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
        <Button
          aria-label="Copy to clipboard"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onPress={handleCopyIconPress}
          onPressEnd={handleCopyPressEnd}
          onPressStart={handleCopyPressStart}
          radius="sm"
          size="sm"
        >
          <CopyIcon
            color={isCopyActive ? "active" : "default"}
            height={20}
            width={20}
          />
        </Button>
        {/* TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon による条件分岐を削除する */}
        {!hideHeartIcon && (
          <Button
            aria-label="Add to favorites"
            className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
            isIconOnly
            onPress={handleToggleFavorite}
            onPressEnd={handleFavoritePressEnd}
            onPressStart={handleFavoritePressStart}
            radius="sm"
            size="sm"
          >
            <HeartIcon
              color={
                isFavorite === true || isFavoriteActive === true
                  ? "favorite"
                  : "default"
              }
              height={20}
              width={20}
            />
          </Button>
        )}
      </div>
      {isCopied ? (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-1/3 flex items-center justify-center bg-[#7B2F1D] px-4 py-3 font-semibold text-base text-white md:py-4 md:text-lg"
        >
          Copied!
        </div>
      ) : null}
    </div>
  );
}
