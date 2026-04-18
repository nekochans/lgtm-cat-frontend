// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { i18nUrlList } from "@/constants/url";
import { TermsPage } from "@/features/terms/components/terms-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import { readMarkdownFile } from "@/lib/markdown/read-markdown-file";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).terms.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).terms.title,
    url: metaTagList(language, appBaseUrl()).terms.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).terms.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).terms.title,
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

async function loadMarkdown(
  docType: "terms" | "privacy" | "external-transmission",
  language: "ja" | "en"
): Promise<string> {
  "use cache";
  cacheLife({
    stale: 2_592_000,
    revalidate: 2_592_000,
    expire: 31_536_000,
  });
  const content = await readMarkdownFile(docType, language);
  if (!content) {
    notFound();
  }
  return content;
}

const EnTerms: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPage
      currentUrlPath={createIncludeLanguageAppPath("terms", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default EnTerms;
