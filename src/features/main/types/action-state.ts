// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";

/**
 * Server Actionの状態を表す型
 * SUCCESS: 成功時、リダイレクト先URLを含む
 * ERROR: 失敗時、エラーメッセージを含む
 */
export type RefreshImagesActionState =
  | { readonly status: "SUCCESS"; readonly redirectUrl: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;

/**
 * refreshRandomCatsAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type RefreshRandomCatsAction = (
  prevState: RefreshImagesActionState,
  language: Language
) => Promise<RefreshImagesActionState>;

/**
 * showLatestCatsAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type ShowLatestCatsAction = (
  prevState: RefreshImagesActionState,
  language: Language
) => Promise<RefreshImagesActionState>;

/**
 * copyRandomCatAction の結果型
 */
export type CopyRandomCatResult =
  | { readonly success: true; readonly markdown: string }
  | { readonly success: false; readonly error: string };

/**
 * copyRandomCatAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type CopyRandomCatAction = () => Promise<CopyRandomCatResult>;
