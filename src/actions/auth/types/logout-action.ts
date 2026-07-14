import type { Language } from "@/types/language";

/**
 * ログアウトを実行する Server Action の型。
 *
 * 成功時は言語対応の Home へ redirect() する（正常終了で resolve することはない）。
 * 想定外の失敗時は例外がそのまま呼び出し元（クライアント）へ伝播する。
 */
export type LogoutAction = (language: Language) => Promise<void>;
