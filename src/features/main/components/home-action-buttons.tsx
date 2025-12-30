// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
import { getActionButtonText } from "@/features/main/service-description-text";
import type { RefreshImagesActionState } from "@/features/main/types/action-state";
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
} from "@/utils/gtm";
import { withCallbacks } from "@/utils/with-callbacks";

/**
 * Server Action のエラーメッセージをユーザー向けにサニタイズする
 * API由来の内部メッセージをそのまま表示しないようにする
 */
function sanitizeErrorMessage(error: string): string {
  if (error === "No images available") {
    return "No images available. Please try again later.";
  }
  return "An unexpected error occurred. Please try again later.";
}

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const router = useRouter();
  const buttonText = getActionButtonText(language);

  // refreshRandomCats用のuseActionState
  const [, refreshAction, isRefreshPending] = useActionState(
    withCallbacks(
      async (
        prevState: RefreshImagesActionState,
        _formData: FormData
      ): Promise<RefreshImagesActionState> =>
        refreshRandomCats(prevState, language),
      {
        onSuccess: (result) => {
          sendClickTopFetchRandomCatButton();
          router.push(result.redirectUrl);
        },
        onError: () => {
          addToast({
            title: "Error",
            description: "Failed to refresh images. Please try again later.",
            color: "danger",
          });
        },
      }
    ),
    null
  );

  // showLatestCats用のuseActionState
  const [, latestAction, isLatestPending] = useActionState(
    withCallbacks(
      async (
        prevState: RefreshImagesActionState,
        _formData: FormData
      ): Promise<RefreshImagesActionState> =>
        showLatestCats(prevState, language),
      {
        onSuccess: (result) => {
          sendClickTopFetchNewArrivalCatButton();
          router.push(result.redirectUrl);
        },
        onError: () => {
          addToast({
            title: "Error",
            description:
              "Failed to load latest images. Please try again later.",
            color: "danger",
          });
        },
      }
    ),
    null
  );

  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomCopy = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await copyRandomCat();

      if (result.success) {
        try {
          await navigator.clipboard.writeText(result.markdown);
          setIsCopied(true);

          // GAイベント送信: ランダムコピー成功時
          sendCopyMarkdownFromRandomButton();

          if (copyTimerRef.current != null) {
            clearTimeout(copyTimerRef.current);
          }
          copyTimerRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        } catch {
          addToast({
            title: "Copy Failed",
            description:
              "Failed to copy to clipboard. Please check browser permissions.",
            color: "danger",
          });
        }
      } else {
        addToast({
          title: "Error",
          description: sanitizeErrorMessage(result.error),
          color: "danger",
        });
      }
    } catch {
      addToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      <div className="relative w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.randomCopy}
          isLoading={isLoading}
          onPress={handleRandomCopy}
          showRepeatIcon={true}
        />
        {isCopied ? (
          <div
            aria-live="polite"
            className="-translate-x-1/2 absolute bottom-full left-1/2 mb-2 rounded bg-[#7B2F1D] px-4 py-2 font-semibold text-sm text-white"
          >
            Copied!
          </div>
        ) : null}
      </div>
      <form action={refreshAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          isLoading={isRefreshPending}
          showRandomIcon={true}
          type="submit"
        />
      </form>
      <form action={latestAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.latestCats}
          isLoading={isLatestPending}
          showCatIcon={true}
          type="submit"
        />
      </form>
    </div>
  );
}
