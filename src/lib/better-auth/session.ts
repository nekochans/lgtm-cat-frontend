import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

/**
 * リクエスト単位でキャッシュされるセッション取得関数。
 *
 * 同一リクエスト内で SessionHeader（Header 表示切替）と RequireLogin（アクセス制御）の
 * 双方から呼ばれても、Turso への問い合わせは 1 回に抑えられる。
 * セッション Cookie を持たない匿名訪問者は DB 照会なしで null が返る。
 */
export const getCachedSession = cache(async () => {
  const requestHeaders = await headers();
  return await auth.api.getSession({ headers: requestHeaders });
});
