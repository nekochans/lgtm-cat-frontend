// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { convertLocaleToLanguage } from "@/features/locale";
import { HomePageContainer } from "@/features/main/components/home-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

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

const HomePage: NextPage = async () => {
  const accessToken = await issueClientCredentialsAccessToken();

  // TODO 後でこのトークンを使ってLGTM画像を取得する処理を実装
  console.log(accessToken);

  return <HomePageContainer currentUrlPath="/" language={language} />;
};

export default HomePage;
