// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { ExternalTransmissionPolicyPageContainer } from "@/features/external-transmission-policy/components/external-transmission-policy-page-container";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["external-transmission-policy"].title,
  openGraph: {
    title: metaTagList(language)["external-transmission-policy"].title,
    url: metaTagList(language)["external-transmission-policy"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["external-transmission-policy"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["external-transmission-policy"].title,
      },
    ],
    locale: convertLocaleToLanguage(language),
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

const ExternalTransmissionPolicyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("external-transmission", language);

  return (
    <ExternalTransmissionPolicyPageContainer
      currentUrlPath={createIncludeLanguageAppPath(
        "external-transmission-policy",
        language
      )}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default ExternalTransmissionPolicyPage;
