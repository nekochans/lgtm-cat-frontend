// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { HomePageContainer } from "@/features/main/components/home-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { appBaseUrl, i18nUrlList } from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).home.title,
  description: metaTagList(language).home.description,
  openGraph: {
    title: metaTagList(language).home.title,
    description: metaTagList(language).home.description,
    url: metaTagList(language).home.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).home.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).home.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.home.ja,
    languages: {
      ja: i18nUrlList.home.ja,
      en: i18nUrlList.home.en,
    },
  },
};

type Props = {
  readonly searchParams: Promise<{
    readonly view?: "random" | "latest";
  }>;
};

const HomePageContent = async ({
  searchParams,
}: {
  readonly searchParams: Props["searchParams"];
}) => {
  const params = await searchParams;
  const view = params.view ?? "random";

  return (
    <HomePageContainer currentUrlPath="/" language={language} view={view} />
  );
};

const HomePage: NextPage<Props> = ({ searchParams }) => (
  <Suspense fallback={null}>
    <HomePageContent searchParams={searchParams} />
  </Suspense>
);

export default HomePage;
