import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { SessionHeader } from "@/components/session-header";
import { i18nUrlList } from "@/constants/url";
import { DocsMcpPage } from "@/features/docs/components/docs-mcp-page";
import {
  loadAllMcpExternalCodes,
  type McpExternalCodes,
} from "@/features/docs/functions/mcp-code-loader";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["docs-mcp"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["docs-mcp"].title,
    url: metaTagList(language, appBaseUrl())["docs-mcp"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["docs-mcp"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["docs-mcp"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-mcp"].en,
    languages: {
      ja: i18nUrlList["docs-mcp"].ja,
      en: i18nUrlList["docs-mcp"].en,
    },
  },
};

async function loadExternalCodes(): Promise<McpExternalCodes> {
  "use cache";
  cacheLife("max");
  return await loadAllMcpExternalCodes();
}

const EnDocsMcp: NextPage = async () => {
  // 外部コードファイルの読み込み結果のみキャッシュし、ページ自体は
  // SessionHeader（実行時 API 使用）を含むためキャッシュしない
  const externalCodes = await loadExternalCodes();

  return (
    <DocsMcpPage
      externalCodes={externalCodes}
      header={
        <SessionHeader
          currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
          language={language}
        />
      }
      language={language}
    />
  );
};

export default EnDocsMcp;
