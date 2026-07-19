import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { SessionHeader } from "@/components/session-header";
import { i18nUrlList } from "@/constants/url";
import { RequireLogin } from "@/features/auth/components/require-login";
import { MyCatsPage } from "@/features/my-cats/components/my-cats-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["my-cats"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["my-cats"].title,
    url: metaTagList(language, appBaseUrl())["my-cats"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["my-cats"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["my-cats"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["my-cats"].en,
    languages: {
      ja: i18nUrlList["my-cats"].ja,
      en: i18nUrlList["my-cats"].en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const EnMyCats: NextPage = () => (
  <Suspense fallback={null}>
    <RequireLogin language={language}>
      <MyCatsPage
        header={
          <SessionHeader
            currentUrlPath={createIncludeLanguageAppPath("my-cats", language)}
            language={language}
          />
        }
        language={language}
      />
    </RequireLogin>
  </Suspense>
);

export default EnMyCats;
