// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};

export function TermsPage({
  language,
  currentUrlPath,
  markdownContent,
}: Props): JSX.Element {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-10 py-[60px]">
        <MarkdownContent content={markdownContent} />
      </div>
    </PageLayout>
  );
}
