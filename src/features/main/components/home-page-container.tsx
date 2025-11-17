// 絶対厳守：編集前に必ずAI実装ルールを読む

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center bg-background">
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
          <ServiceDescription language={language} />
          <HomeActionButtons language={language} />
        </div>
        <RandomLgtmImages />
      </div>
    </main>
    <Footer language={language} />
  </div>
);
