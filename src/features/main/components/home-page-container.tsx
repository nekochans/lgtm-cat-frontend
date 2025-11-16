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
  <>
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <RandomLgtmImages />
    <Footer language={language} />
  </>
);
