// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { MaintenancePageContainer } from "@/features/errors/components/maintenance-page-container";
import type { Language } from "@/features/language";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";

const language: Language = "en";

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
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.maintenance.en,
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

const EnMaintenancePage: NextPage = () => (
  <MaintenancePageContainer language={language} />
);

export default EnMaintenancePage;
