// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { TermsPage } from "@/features/terms/components/terms-page";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

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
    canonical: i18nUrlList.terms.ja,
    languages: {
      ja: i18nUrlList.terms.ja,
      en: i18nUrlList.terms.en,
    },
  },
};

const Terms: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPage
      currentUrlPath={createIncludeLanguageAppPath("terms", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default Terms;
