// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import { useCallback, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtmImage";
import { appBaseUrl } from "@/features/url";

type Props = {
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};

export function LgtmImage({ id, imageUrl }: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = useCallback(() => {
    const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
    navigator.clipboard.writeText(markdown);
  }, [imageUrl]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((previous) => !previous);
  }, []);

  const handleCopyIconPress = useCallback(() => {
    handleCopy();
  }, [handleCopy]);

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      data-lgtm-image-id={id}
    >
      <button
        aria-label="Copy LGTM markdown"
        className="relative block h-[220px] w-full cursor-pointer border-0 bg-transparent p-0"
        onClick={handleCopy}
        type="button"
      >
        <Image
          alt="LGTM image"
          className="object-cover"
          fill
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
          radius="sm"
          size="sm"
        >
          <CopyIcon color="default" height={20} width={20} />
        </Button>
        <Button
          aria-label="Add to favorites"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onPress={handleToggleFavorite}
          radius="sm"
          size="sm"
        >
          <HeartIcon
            color={isFavorite ? "favorite" : "default"}
            height={20}
            width={20}
          />
        </Button>
      </div>
    </div>
  );
}
