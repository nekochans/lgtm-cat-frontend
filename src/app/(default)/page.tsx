// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { convertLocaleToLanguage } from "@/features/locale";
import { HomePageContainer } from "@/features/main/components/home-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import {
  fetchLgtmImagesInRandom,
  fetchLgtmImagesInRecentlyCreated,
} from "@/features/main/functions/fetch-lgtm-images";

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

  const fetchedRandomLgtmImages = await fetchLgtmImagesInRandom(accessToken);

  const fetchedRecentlyCreatedLgtmImages = await fetchLgtmImagesInRecentlyCreated(accessToken);

  // TODO 後でLGTM画像を表示するComponentを追加
  console.log(fetchedRandomLgtmImages);
  console.log(fetchedRecentlyCreatedLgtmImages);

  return <HomePageContainer currentUrlPath="/" language={language} />;
};

export default HomePage;
