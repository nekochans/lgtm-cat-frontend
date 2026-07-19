import type { JSX } from "react";
import type { LoginAction } from "@/actions/auth/types/login-action";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { LoginContent } from "@/features/auth/components/login-content";
import { createLoginAppPath } from "@/functions/auth";
import { switchLanguageInAppPath } from "@/functions/language";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath, LanguageSwitchHrefs } from "@/types/url";

interface Props {
  readonly errorCode?: string;
  readonly language: Language;
  readonly loginAction: LoginAction;
  readonly returnTo?: IncludeLanguageAppPath;
}

/**
 * /login はログイン済みユーザーが RequireAnonymous でリダイレクトされた後にのみ
 * 描画されるため、Header は静的な未ログイン表示でよい（SessionHeader は不要）。
 */
export function LoginPage({
  errorCode,
  language,
  loginAction,
  returnTo,
}: Props): JSX.Element {
  const currentUrlPath = createIncludeLanguageAppPath("login", language);

  // 言語切替で error / returnTo クエリが失われると、エラー画面から明示的な再試行を
  // 待たずに OAuth が自動再開してしまう。切替先の言語に合わせた returnTo と
  // エラー状態を言語切替リンクへ引き継ぐ
  const createLanguageSwitchHref = (targetLanguage: Language) =>
    createLoginAppPath(targetLanguage, {
      error: errorCode,
      returnTo:
        returnTo == null
          ? undefined
          : switchLanguageInAppPath(returnTo, targetLanguage),
    });

  const languageSwitchHrefs: LanguageSwitchHrefs = {
    ja: createLanguageSwitchHref("ja"),
    en: createLanguageSwitchHref("en"),
  };

  return (
    <PageLayout
      header={
        <Header
          currentUrlPath={currentUrlPath}
          isLoggedIn={false}
          language={language}
          languageSwitchHrefs={languageSwitchHrefs}
          loginReturnTo={returnTo}
        />
      }
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center justify-center"
    >
      <LoginContent
        hasError={errorCode != null}
        language={language}
        loginAction={loginAction}
        returnTo={returnTo}
      />
    </PageLayout>
  );
}
