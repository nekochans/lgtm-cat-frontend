// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
}

export const HomePage = ({ language, currentUrlPath, view }: Props) => (
  <PageLayout
    currentUrlPath={currentUrlPath}
    isLoggedIn={false}
    language={language}
    mainClassName="flex w-full flex-1 flex-col items-center bg-background"
  >
    <div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
      <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
        <ServiceDescription language={language} />
        <HomeActionButtons language={language} />
      </div>
      {view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />}
    </div>
  </PageLayout>
);
