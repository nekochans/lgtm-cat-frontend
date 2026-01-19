// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { DocsMcpPage } from "@/features/docs/components/docs-mcp-page";
import { loadAllMcpExternalCodes } from "@/features/docs/functions/mcp-code-loader";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

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
