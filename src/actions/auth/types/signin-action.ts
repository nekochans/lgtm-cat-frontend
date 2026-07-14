import type { Language } from "@/types/language";

/**
 * GitHub OAuth フローを開始する Server Action の型。
 *
 * 成功時は GitHub の authorize URL へ、失敗時は `/login?error=signin_failed` へ
 * redirect() するため、正常終了で resolve することはない（redirect は内部で throw する）。
 */
export type SigninAction = (language: Language) => Promise<void>;
