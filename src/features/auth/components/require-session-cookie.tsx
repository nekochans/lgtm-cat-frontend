import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { hasSessionCookie } from "@/lib/better-auth/session-cookie";
import type { Language } from "@/types/language";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
}

/**
 * /logout 専用のガード。セッション Cookie の有無のみで判定し、DB へは問い合わせない。
 *
 * RequireLogin（getSession() = Turso 照会）を使うと、DB 障害時にガードの時点で例外となり、
 * Cookie 削除でログアウトできるはずの signOut() にも再試行画面にも到達できない。
 * 期限切れ等の無効 Cookie では children（LogoutPage）が描画されるが、signOut は冪等のため安全。
 *
 * 実行時 API（headers 経由の Cookie 参照）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireSessionCookie({
  language,
  children,
}: Props): Promise<JSX.Element> {
  const sessionCookieExists = await hasSessionCookie();

  if (!sessionCookieExists) {
    redirect(createIncludeLanguageAppPath("home", language));
  }

  return <>{children}</>;
}
