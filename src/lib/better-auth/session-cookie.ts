import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

/**
 * セッション Cookie の有無のみを判定する（DB への問い合わせ・復号は行わない）。
 *
 * /logout のガード（RequireSessionCookie）専用。getSessionCookie は Cookie ヘッダーから
 * better-auth.session_token（本番の __Secure- 接頭辞付きを含む）を探すだけなので（F36）、
 * Turso 障害時でも失敗しない。auth.ts に依存しないため import 時の環境変数チェックによる
 * throw も持ち込まない。
 *
 * 注意: Cookie の存在確認のみであり、セッションの有効性（期限・失効）は検証しない。
 * アクセス制御用途（favorites / my-cats の RequireLogin）には使用してはならない。
 */
export const hasSessionCookie = async (): Promise<boolean> => {
  const requestHeaders = await headers();
  return getSessionCookie(requestHeaders) != null;
};
