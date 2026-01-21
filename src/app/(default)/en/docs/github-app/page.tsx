// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { DocsGitHubAppPage } from "@/features/docs/components/docs-github-app-page";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-github-app"].title,
  openGraph: {
    title: metaTagList(language)["docs-github-app"].title,
    url: metaTagList(language)["docs-github-app"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-github-app"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-github-app"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-github-app"].en,
    languages: {
      ja: i18nUrlList["docs-github-app"].ja,
      en: i18nUrlList["docs-github-app"].en,
    },
  },
};

const EnDocsGitHubApp: NextPage = async () => {
  "use cache";
  cacheLife("max");

  return (
    <DocsGitHubAppPage
      currentUrlPath={createIncludeLanguageAppPath("docs-github-app", language)}
      language={language}
    />
  );
};

export default EnDocsGitHubApp;
