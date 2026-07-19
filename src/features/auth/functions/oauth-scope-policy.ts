/**
 * OAuth scope の固定化ポリシー（Issue #480 プライバシー設計）。
 *
 * better-auth の /sign-in/social と /link-social は body の scopes を
 * disableDefaultScope の設定に関わらず authorize URL へ無条件に追記するため（F37）、
 * 追加 scope の要求をアプリケーション側で拒否する。auth.ts の hooks.before /
 * databaseHooks から利用する。
 */
const scopeRestrictedPaths: readonly string[] = [
  "/sign-in/social",
  "/link-social",
];

/**
 * 追加 scope を要求するリクエストかどうかを判定する。
 * /link-social は disabledPaths で無効化済みだが、多層防御として判定対象に含める。
 */
export function isScopeRequestForbidden(
  path: string,
  requestBody: unknown
): boolean {
  if (!scopeRestrictedPaths.includes(path)) {
    return false;
  }

  if (typeof requestBody !== "object" || requestBody == null) {
    return false;
  }

  const { scopes } = requestBody as { readonly scopes?: unknown };

  return Array.isArray(scopes) && scopes.length > 0;
}

/**
 * account.scope が空でない（= 何らかの OAuth scope が付与された token を
 * 保存しようとしている）事を判定する。GitHub は scope 未要求時の token 応答で
 * 空文字を返すため、null / undefined / 空白のみの文字列は「空」とみなす。
 */
export function hasNonEmptyAccountScope(
  scope: string | null | undefined
): boolean {
  return typeof scope === "string" && scope.trim() !== "";
}
