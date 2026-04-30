import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { DocsHowToUsePage } from "@/features/docs/components/docs-how-to-use-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["docs-how-to-use"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["docs-how-to-use"].title,
    url: metaTagList(language, appBaseUrl())["docs-how-to-use"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["docs-how-to-use"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["docs-how-to-use"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-how-to-use"].en,
    languages: {
      ja: i18nUrlList["docs-how-to-use"].ja,
      en: i18nUrlList["docs-how-to-use"].en,
    },
  },
};

const EnDocsHowToUse: NextPage = () => (
  <DocsHowToUsePage
    currentUrlPath={createIncludeLanguageAppPath("docs-how-to-use", language)}
    language={language}
  />
);

export default EnDocsHowToUse;
