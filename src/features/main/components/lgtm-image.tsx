// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtm-image";
import { appBaseUrl } from "@/features/url";

type Props = {
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};

export function LgtmImage({ id, imageUrl }: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCopyActive, setIsCopyActive] = useState(false);
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);

  const handleCopy = useCallback(() => {
    const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
    navigator.clipboard.writeText(markdown);
    setIsCopied(true);
    if (copyTimerRef.current != null) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  }, [imageUrl]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((previous) => !previous);
  }, []);

  const handleCopyIconPress = useCallback(() => {
    handleCopy();
  }, [handleCopy]);

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
      className="relative overflow-hidden rounded-lg"
      data-lgtm-image-id={id}
    >
      <button
        aria-label="Copy LGTM markdown"
        className="relative block aspect-[4/3] min-h-[220px] w-full cursor-pointer border-0 bg-neutral-50 p-0 dark:bg-neutral-900"
        onClick={handleCopy}
        type="button"
      >
        <Image
          alt="LGTM image"
          className="object-contain"
          fill
          objectPosition="center top"
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={imageUrl}
        />
      </button>
      <div className="absolute top-2 right-2 flex gap-2">
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
