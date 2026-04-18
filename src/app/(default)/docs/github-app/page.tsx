// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { i18nUrlList } from "@/constants/url";
import { DocsGitHubAppPage } from "@/features/docs/components/docs-github-app-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["docs-github-app"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["docs-github-app"].title,
    url: metaTagList(language, appBaseUrl())["docs-github-app"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["docs-github-app"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["docs-github-app"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-github-app"].ja,
    languages: {
      ja: i18nUrlList["docs-github-app"].ja,
      en: i18nUrlList["docs-github-app"].en,
    },
  },
};

const DocsGitHubApp: NextPage = async () => {
  "use cache";
  cacheLife("max");

  return (
    <DocsGitHubAppPage
      currentUrlPath={createIncludeLanguageAppPath("docs-github-app", language)}
      language={language}
    />
  );
};

export default DocsGitHubApp;
