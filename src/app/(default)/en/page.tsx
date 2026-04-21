// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { i18nUrlList } from "@/constants/url";
import { HomePage } from "@/features/main/components/home-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).home.title,
  description: metaTagList(language, appBaseUrl()).home.description,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).home.title,
    description: metaTagList(language, appBaseUrl()).home.description,
    url: metaTagList(language, appBaseUrl()).home.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).home.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).home.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.home.en,
    languages: {
      ja: i18nUrlList.home.ja,
      en: i18nUrlList.home.en,
    },
  },
};

interface Props {
  readonly searchParams: Promise<{
    readonly view?: "random" | "latest";
  }>;
}

const EnHomePageContent = async ({
  searchParams,
}: {
  readonly searchParams: Props["searchParams"];
}) => {
  const params = await searchParams;
  const view = params.view ?? "random";

  return <HomePage currentUrlPath="/en" language={language} view={view} />;
};

const EnHomePage: NextPage<Props> = ({ searchParams }) => (
  <Suspense fallback={null}>
    <EnHomePageContent searchParams={searchParams} />
  </Suspense>
);

export default EnHomePage;
