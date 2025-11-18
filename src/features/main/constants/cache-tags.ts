// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * LGTM画像のキャッシュタグ定数
 *
 * cacheTag() と updateTag() で使用するタグ名を一元管理します。
 * タグ名の不一致によるキャッシュ無効化の失敗を防ぐため、
 * 必ずこの定数を使用してください。
 */
export const CACHE_TAG_LGTM_IMAGES_RANDOM =
  "fetchedLgtmImagesInRandom" as const;
export const CACHE_TAG_LGTM_IMAGES_LATEST =
  "fetchedLgtmImagesInRecentlyCreated" as const;
