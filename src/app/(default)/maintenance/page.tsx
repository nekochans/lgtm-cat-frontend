// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { MaintenancePage } from "@/features/errors/components/maintenance-page";
import type { Language } from "@/features/language";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { appBaseUrl, i18nUrlList } from "@/features/url";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).maintenance.title,
  openGraph: {
    title: metaTagList(language).maintenance.title,
    url: metaTagList(language).maintenance.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).maintenance.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).maintenance.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.maintenance.ja,
    languages: {
      ja: i18nUrlList.maintenance.ja,
      en: i18nUrlList.maintenance.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Maintenance: NextPage = () => <MaintenancePage language={language} />;

export default Maintenance;
