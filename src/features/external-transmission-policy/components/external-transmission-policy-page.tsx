import type { JSX } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
  readonly markdownContent: string;
}

export function ExternalTransmissionPolicyPage({
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
