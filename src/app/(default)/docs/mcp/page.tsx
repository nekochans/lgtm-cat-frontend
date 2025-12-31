// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsMcpPageContainer } from "@/features/docs/components/docs-mcp-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-mcp"].title,
  openGraph: {
    title: metaTagList(language)["docs-mcp"].title,
    url: metaTagList(language)["docs-mcp"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-mcp"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-mcp"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-mcp"].ja,
    languages: {
      ja: i18nUrlList["docs-mcp"].ja,
      en: i18nUrlList["docs-mcp"].en,
    },
  },
};

const DocsMcpPage: NextPage = () => (
  <DocsMcpPageContainer
    currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
    language={language}
  />
);

export default DocsMcpPage;
