import type { Metadata, NextPage } from "next";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/metaTag";
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
    locale: convertLocaleToLanguage(language),
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

const HomePage: NextPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <h1>Hello new design!</h1>
  </main>
);

export default HomePage;
