// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { i18nUrlList } from "@/constants/url";
import { ExternalTransmissionPolicyPage } from "@/features/external-transmission-policy/components/external-transmission-policy-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import { readMarkdownFile } from "@/lib/markdown/read-markdown-file";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["external-transmission-policy"]
    .title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["external-transmission-policy"]
      .title,
    url: metaTagList(language, appBaseUrl())["external-transmission-policy"]
      .ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["external-transmission-policy"]
          .ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["external-transmission-policy"]
          .title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["external-transmission-policy"].ja,
    languages: {
      ja: i18nUrlList["external-transmission-policy"].ja,
      en: i18nUrlList["external-transmission-policy"].en,
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

const ExternalTransmissionPolicy: NextPage = async () => {
  const markdownContent = await loadMarkdown("external-transmission", language);

  return (
    <ExternalTransmissionPolicyPage
      currentUrlPath={createIncludeLanguageAppPath(
        "external-transmission-policy",
        language
      )}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default ExternalTransmissionPolicy;
