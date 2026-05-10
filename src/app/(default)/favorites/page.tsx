import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
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

const Favorites: NextPage = () => <FavoritesPage language={language} />;

export default Favorites;
