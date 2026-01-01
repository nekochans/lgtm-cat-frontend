// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { UploadPage } from "@/features/main/components/upload-page";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { appBaseUrl, appPathList, i18nUrlList } from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).upload.title,
  description: metaTagList(language).upload.description,
  openGraph: {
    title: metaTagList(language).upload.title,
    description: metaTagList(language).upload.description,
    url: metaTagList(language).upload.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).upload.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).upload.title,
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
