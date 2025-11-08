"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
};

export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <>
    <Header currentUrlPath="/" isLoggedIn={false} language={language} />
    <h1>Hello new design!</h1>
    <Footer language={language} />
  </>
);
