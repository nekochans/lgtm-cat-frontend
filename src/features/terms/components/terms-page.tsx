import type { JSX, ReactNode } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/types/language";

interface Props {
  readonly header: ReactNode;
  readonly language: Language;
  readonly markdownContent: string;
}

export function TermsPage({
  header,
  language,
  markdownContent,
}: Props): JSX.Element {
  return (
    <PageLayout
      header={header}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-10 py-[60px]">
        <MarkdownContent content={markdownContent} />
      </div>
    </PageLayout>
  );
}
