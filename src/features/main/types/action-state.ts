// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * Server Actionの状態を表す型
 * SUCCESS: 成功時、リダイレクト先URLを含む
 * ERROR: 失敗時、エラーメッセージを含む
 */
export type RefreshImagesActionState =
  | { readonly status: "SUCCESS"; readonly redirectUrl: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;
