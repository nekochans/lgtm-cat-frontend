import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

/**
 * GitHub OAuth フローを開始する Server Action の型。
 *
 * 成功時は GitHub の authorize URL へ、失敗時は言語対応のログインエラー URL へ
 * redirect() する。OAuth 完了後は検証済みの returnTo（未指定時は Home）へ戻る。
 * 正常終了で resolve することはない（redirect は内部で throw する）。
 */
export type LoginAction = (
  language: Language,
  returnTo?: IncludeLanguageAppPath
) => Promise<void>;
