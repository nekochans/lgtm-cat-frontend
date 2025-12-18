// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly children: ReactNode;
};

export function ErrorLayout({ language, currentUrlPath, children }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-orange-50">
      <Header
        currentUrlPath={currentUrlPath}
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
