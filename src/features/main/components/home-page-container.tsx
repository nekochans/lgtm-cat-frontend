// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtmImage";

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
  readonly lgtmImages: LgtmImageType;
};

export const HomePageContainer = ({ language, currentUrlPath, lgtmImages }: Props) => (
  <>
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
      <LgtmImages images={lgtmImages} />
    <Footer language={language} />
  </>
);
