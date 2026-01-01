// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { updateTag } from "next/cache";
import type { Language } from "@/features/language";
import {
  CACHE_TAG_LGTM_IMAGES_LATEST,
  CACHE_TAG_LGTM_IMAGES_RANDOM,
} from "@/features/main/constants/cache-tags";
import type { RefreshImagesActionState } from "@/features/main/types/action-state";
import { i18nUrlList } from "@/features/url";

/**
 * ランダムなLGTM画像を再取得するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param _prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 */
// biome-ignore lint/suspicious/useAwait: Server Actions must be async (Next.js requirement)
export async function refreshRandomCats(
  _prevState: RefreshImagesActionState,
  language: Language
): Promise<RefreshImagesActionState> {
  try {
    updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);

    const targetUrl =
      language === "ja"
        ? `${i18nUrlList.home.ja}?view=random`
        : `${i18nUrlList.home.en}?view=random`;

    return { status: "SUCCESS", redirectUrl: targetUrl };
  } catch {
    return { status: "ERROR", message: "Failed to refresh images" };
  }
}

/**
 * 最新のLGTM画像を表示するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param _prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 */
// biome-ignore lint/suspicious/useAwait: Server Actions must be async (Next.js requirement)
export async function showLatestCats(
  _prevState: RefreshImagesActionState,
  language: Language
): Promise<RefreshImagesActionState> {
  try {
    updateTag(CACHE_TAG_LGTM_IMAGES_LATEST);

    const targetUrl =
      language === "ja"
        ? `${i18nUrlList.home.ja}?view=latest`
        : `${i18nUrlList.home.en}?view=latest`;

    return { status: "SUCCESS", redirectUrl: targetUrl };
  } catch {
    return { status: "ERROR", message: "Failed to show latest images" };
  }
}
