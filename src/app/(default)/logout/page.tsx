import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { logoutAction } from "@/actions/auth/logout-action";
import { i18nUrlList } from "@/constants/url";
import { LogoutPage } from "@/features/auth/components/logout-page";
import { RequireSessionCookie } from "@/features/auth/components/require-session-cookie";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).logout.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).logout.title,
    url: metaTagList(language, appBaseUrl()).logout.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).logout.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).logout.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.logout.ja,
    languages: {
      ja: i18nUrlList.logout.ja,
      en: i18nUrlList.logout.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Logout: NextPage = () => (
  <Suspense fallback={null}>
    <RequireSessionCookie language={language}>
      <LogoutPage language={language} logoutAction={logoutAction} />
    </RequireSessionCookie>
  </Suspense>
);

export default Logout;
