import type { ReactNode } from "react";
import { ComingSoonContent } from "@/components/coming-soon-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/types/language";

interface Props {
  readonly header: ReactNode;
  readonly language: Language;
}

export function FavoritesPage({ header, language }: Props) {
  return (
    <PageLayout
      header={header}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center"
    >
      <ComingSoonContent language={language} />
    </PageLayout>
  );
}
