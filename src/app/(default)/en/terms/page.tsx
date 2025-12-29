// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { TermsPageContainer } from "@/features/terms/components/terms-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language).terms.title,
  openGraph: {
    title: metaTagList(language).terms.title,
    url: metaTagList(language).terms.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).terms.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).terms.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.terms.en,
    languages: {
      ja: i18nUrlList.terms.ja,
      en: i18nUrlList.terms.en,
    },
  },
};

const EnTermsPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPageContainer
      currentUrlPath={createIncludeLanguageAppPath("terms", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default EnTermsPage;
