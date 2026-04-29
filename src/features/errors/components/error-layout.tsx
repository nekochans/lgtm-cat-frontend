import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly children: ReactNode;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
}

export function ErrorLayout({ language, currentUrlPath, children }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-orange-50">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
      <main className="flex w-full flex-1 flex-col items-center">
        <div className="flex w-full max-w-[1020px] flex-col items-center">
          {children}
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
