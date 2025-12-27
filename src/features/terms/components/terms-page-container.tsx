// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MarkdownContent } from "@/components/markdown-content";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};

export function TermsPageContainer({
  language,
  currentUrlPath,
  markdownContent,
}: Props): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
      <main className="flex w-full flex-1 flex-col items-center bg-background">
        <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-10 py-[60px]">
          <MarkdownContent content={markdownContent} />
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
