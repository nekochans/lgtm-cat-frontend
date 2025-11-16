// 絶対厳守：編集前に必ずAI実装ルールを読む

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-[#fff4e9]">
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center bg-[#fff4e9]">
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div
          aria-hidden
          className="flex h-[210px] w-full max-w-[1020px] flex-col items-center gap-6 rounded-xl px-[12px] pt-[40px] pb-[32px]"
        />
        <RandomLgtmImages />
      </div>
    </main>
    <Footer language={language} />
  </div>
);
