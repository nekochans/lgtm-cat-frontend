// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { LgtmImageUrl } from "@/features/main/types/lgtm-image";
import { appBaseUrl } from "@/features/url";

/**
 * LGTM画像のマークダウンソースを生成する
 *
 * @param imageUrl - LGTM画像のURL（LgtmImageUrl型）
 * @returns マークダウン形式の文字列
 *
 * @example
 * ```typescript
 * const markdown = generateLgtmMarkdown(createLgtmImageUrl("https://lgtm-images.lgtmeow.com/xxx.webp"));
 * // => "[![LGTMeow](https://lgtm-images.lgtmeow.com/xxx.webp)](https://lgtmeow.com)"
 * ```
 */
export function generateLgtmMarkdown(imageUrl: LgtmImageUrl): string {
  return `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
}
