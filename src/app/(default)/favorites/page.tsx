import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { SessionHeader } from "@/components/session-header";
import { i18nUrlList } from "@/constants/url";
import { RequireLogin } from "@/features/auth/components/require-login";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).favorites.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).favorites.title,
    url: metaTagList(language, appBaseUrl()).favorites.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).favorites.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).favorites.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.favorites.ja,
    languages: {
      ja: i18nUrlList.favorites.ja,
      en: i18nUrlList.favorites.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Favorites: NextPage = () => (
  <Suspense fallback={null}>
    <RequireLogin language={language}>
      <FavoritesPage
        header={
          <SessionHeader
            currentUrlPath={createIncludeLanguageAppPath("favorites", language)}
            language={language}
          />
        }
        language={language}
      />
    </RequireLogin>
  </Suspense>
);

export default Favorites;
