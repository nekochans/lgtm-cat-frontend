// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { appPathList, i18nUrlList } from "@/constants/url";
import { UploadPage } from "@/features/upload/components/upload-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";

const language = "ja";

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
    canonical: i18nUrlList.upload.ja,
    languages: {
      ja: i18nUrlList.upload.ja,
      en: i18nUrlList.upload.en,
    },
  },
};

const Upload: NextPage = () => (
  <UploadPage currentUrlPath={appPathList.upload} language={language} />
);

export default Upload;
