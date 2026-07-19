import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { resolveLoginReturnPath } from "@/functions/auth";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
  readonly returnTo?: IncludeLanguageAppPath;
}

/**
 * /login 用のガード。ログイン済みの場合は検証済みの戻り先へリダイレクトする。
 *
 * 実行時 API（headers 経由のセッション取得）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireAnonymous({
  language,
  children,
  returnTo,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  if (session != null) {
    redirect(resolveLoginReturnPath(returnTo, language));
  }

  return <>{children}</>;
}
