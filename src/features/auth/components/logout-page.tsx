import type { JSX } from "react";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { LogoutContent } from "@/features/auth/components/logout-content";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
  readonly logoutAction: LogoutAction;
}

/**
 * /logout はセッション Cookie を持たないユーザーが RequireSessionCookie で
 * リダイレクトされた後にのみ描画されるため、Header は静的なログイン済み表示でよい
 * （SessionHeader は不要）。期限切れ等の無効 Cookie でも描画され得るが、直後に
 * logoutAction が Cookie を削除して Home へ遷移するため一瞬の表示に留まる。
 */
export function LogoutPage({ language, logoutAction }: Props): JSX.Element {
  const currentUrlPath = createIncludeLanguageAppPath("logout", language);

  return (
    <PageLayout
      header={
        <Header
          currentUrlPath={currentUrlPath}
          isLoggedIn={true}
          language={language}
        />
      }
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center justify-center"
    >
      <LogoutContent language={language} logoutAction={logoutAction} />
    </PageLayout>
  );
}
