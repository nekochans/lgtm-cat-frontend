// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsHowToUsePageContainer } from "@/features/docs/components/docs-how-to-use-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-how-to-use"].title,
  openGraph: {
    title: metaTagList(language)["docs-how-to-use"].title,
    url: metaTagList(language)["docs-how-to-use"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-how-to-use"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-how-to-use"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-how-to-use"].ja,
    languages: {
      ja: i18nUrlList["docs-how-to-use"].ja,
      en: i18nUrlList["docs-how-to-use"].en,
    },
  },
};

const DocsHowToUsePage: NextPage = () => (
  <DocsHowToUsePageContainer
    currentUrlPath={createIncludeLanguageAppPath("docs-how-to-use", language)}
    language={language}
  />
);

export default DocsHowToUsePage;
