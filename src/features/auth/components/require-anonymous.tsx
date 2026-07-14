import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
}

/**
 * /login 用のガード。ログイン済みの場合は言語対応の Home へリダイレクトする。
 *
 * 実行時 API（headers 経由のセッション取得）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireAnonymous({
  language,
  children,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  if (session != null) {
    redirect(createIncludeLanguageAppPath("home", language));
  }

  return <>{children}</>;
}
