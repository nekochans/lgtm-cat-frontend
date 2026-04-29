import type { LgtmImageUrl } from "@/types/lgtm-image";
import type { Url } from "@/types/url";

/**
 * LGTM画像のマークダウンソースを生成する
 *
 * @param imageUrl - LGTM画像のURL（LgtmImageUrl型）
 * @param appBaseUrl - アプリケーションのベースURL
 * @returns マークダウン形式の文字列
 *
 * @example
 * ```typescript
 * const markdown = generateLgtmMarkdown(
 *   createLgtmImageUrl("https://lgtm-images.lgtmeow.com/xxx.webp"),
 *   "https://lgtmeow.com" as Url,
 * );
 * // => "[![LGTMeow](https://lgtm-images.lgtmeow.com/xxx.webp)](https://lgtmeow.com)"
 * ```
 */
export function generateLgtmMarkdown(
  imageUrl: LgtmImageUrl,
  appBaseUrl: Url
): string {
  return `[![LGTMeow](${imageUrl})](${appBaseUrl})`;
}
