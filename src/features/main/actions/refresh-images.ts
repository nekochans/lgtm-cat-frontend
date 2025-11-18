// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Language } from "@/features/language";
import {
  CACHE_TAG_LGTM_IMAGES_LATEST,
  CACHE_TAG_LGTM_IMAGES_RANDOM,
} from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

/**
 * ランダムねこ画像のキャッシュを更新して再表示
 */
export async function refreshRandomCats(language: Language): Promise<void> {
  await updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);

  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=random`
      : `${i18nUrlList.home.en}?view=random`;

  redirect(targetUrl);
}

/**
 * 最新ねこ画像のキャッシュを更新して表示
 */
export async function showLatestCats(language: Language): Promise<void> {
  await updateTag(CACHE_TAG_LGTM_IMAGES_LATEST);

  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=latest`
      : `${i18nUrlList.home.en}?view=latest`;

  redirect(targetUrl);
}
