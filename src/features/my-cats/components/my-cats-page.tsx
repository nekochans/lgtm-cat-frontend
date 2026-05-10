import { ComingSoonContent } from "@/components/coming-soon-content";
import { PageLayout } from "@/components/page-layout";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function MyCatsPage({ language }: Props) {
  return (
    <PageLayout
      currentUrlPath={createIncludeLanguageAppPath("my-cats", language)}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center"
    >
      <ComingSoonContent language={language} />
    </PageLayout>
  );
}
