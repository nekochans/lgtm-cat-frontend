import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { UploadPage } from "@/features/upload/components/upload-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).upload.title,
  description: metaTagList(language, appBaseUrl()).upload.description,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).upload.title,
    description: metaTagList(language, appBaseUrl()).upload.description,
    url: metaTagList(language, appBaseUrl()).upload.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).upload.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).upload.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.upload.en,
    languages: {
      ja: i18nUrlList.upload.ja,
      en: i18nUrlList.upload.en,
    },
  },
};

const EnUpload: NextPage = () => (
  <UploadPage
    currentUrlPath={createIncludeLanguageAppPath("upload", language)}
    language={language}
  />
);

export default EnUpload;
