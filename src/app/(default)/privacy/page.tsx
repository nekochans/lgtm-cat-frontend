import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { i18nUrlList } from "@/constants/url";
import { PrivacyPage } from "@/features/privacy/components/privacy-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import { readMarkdownFile } from "@/lib/markdown/read-markdown-file";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).privacy.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).privacy.title,
    url: metaTagList(language, appBaseUrl()).privacy.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).privacy.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).privacy.title,
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

const Privacy: NextPage = async () => {
  const markdownContent = await loadMarkdown("privacy", language);

  return (
    <PrivacyPage
      currentUrlPath={createIncludeLanguageAppPath("privacy", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default Privacy;
