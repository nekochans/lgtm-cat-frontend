// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { i18nUrlList } from "@/constants/url";
import { DocsMcpPage } from "@/features/docs/components/docs-mcp-page";
import { loadAllMcpExternalCodes } from "@/features/docs/functions/mcp-code-loader";
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

const EnDocsMcp: NextPage = async () => {
  "use cache";
  cacheLife("max");

  // 外部コードファイルをパラレルで読み込み
  // Promise.all により複数ファイルを並列取得してパフォーマンス最適化
  const externalCodes = await loadAllMcpExternalCodes();

  return (
    <DocsMcpPage
      currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
      externalCodes={externalCodes}
      language={language}
    />
  );
};

export default EnDocsMcp;
