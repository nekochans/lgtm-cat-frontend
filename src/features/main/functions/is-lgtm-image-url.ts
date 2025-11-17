// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * LGTM画像URLの形式が正しいかどうかを検証する
 *
 * @param url - 検証対象のURL文字列
 * @returns URLが有効なLGTM画像URL（.webp拡張子、lgtmeow.comドメイン）である場合は true
 */
export function isLgtmImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    const { hostname } = parsedUrl;
    if (hostname !== "lgtmeow.com" && !hostname.endsWith(".lgtmeow.com")) {
      return false;
    }

    if (!parsedUrl.pathname.endsWith(".webp")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
