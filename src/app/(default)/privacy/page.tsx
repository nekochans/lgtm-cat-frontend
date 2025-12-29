// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { PrivacyPageContainer } from "@/features/privacy/components/privacy-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).privacy.title,
  openGraph: {
    title: metaTagList(language).privacy.title,
    url: metaTagList(language).privacy.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).privacy.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).privacy.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.privacy.ja,
    languages: {
      ja: i18nUrlList.privacy.ja,
      en: i18nUrlList.privacy.en,
    },
  },
};

const PrivacyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("privacy", language);

  return (
    <PrivacyPageContainer
      currentUrlPath={createIncludeLanguageAppPath("privacy", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default PrivacyPage;
