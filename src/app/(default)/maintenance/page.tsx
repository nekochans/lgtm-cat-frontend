import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { MaintenancePage } from "@/features/errors/components/maintenance-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).maintenance.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).maintenance.title,
    url: metaTagList(language, appBaseUrl()).maintenance.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).maintenance.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).maintenance.title,
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
