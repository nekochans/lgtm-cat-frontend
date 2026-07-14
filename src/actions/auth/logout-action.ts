"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { isLanguage } from "@/functions/language";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { auth } from "@/lib/better-auth/auth";
import type { Language } from "@/types/language";

/**
 * auth.api.signOut はセッション行の削除（best effort。削除失敗は better-auth 内部で
 * 捕捉されログ出力のみ）とセッション Cookie の削除を行い、常に success を返す（F13）。
 * したがってここで throw が起きるのは想定外の異常時のみ。その場合は catch せず
 * 呼び出し元（LogoutContent）へ伝播させ、クライアント側でエラー表示する。
 */
export const logoutAction: LogoutAction = async (
  language: Language
): Promise<void> => {
  const safeLanguage = isLanguage(language) ? language : "ja";
  const requestHeaders = await headers();

  await auth.api.signOut({ headers: requestHeaders });

  redirect(createIncludeLanguageAppPath("home", safeLanguage));
};
