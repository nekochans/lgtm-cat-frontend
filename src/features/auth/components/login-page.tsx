import type { JSX } from "react";
import type { SigninAction } from "@/actions/auth/types/signin-action";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { LoginContent } from "@/features/auth/components/login-content";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly hasError: boolean;
  readonly language: Language;
  readonly signinAction: SigninAction;
}

/**
 * /login はログイン済みユーザーが RequireAnonymous でリダイレクトされた後にのみ
 * 描画されるため、Header は静的な未ログイン表示でよい（SessionHeader は不要）。
 */
export function LoginPage({
  hasError,
  language,
  signinAction,
}: Props): JSX.Element {
  const currentUrlPath = createIncludeLanguageAppPath("login", language);

  return (
    <PageLayout
      header={
        <Header
          currentUrlPath={currentUrlPath}
          isLoggedIn={false}
          language={language}
        />
      }
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center justify-center"
    >
      <LoginContent
        hasError={hasError}
        language={language}
        signinAction={signinAction}
      />
    </PageLayout>
  );
}
