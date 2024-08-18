import { convertLocaleToLanguage } from '@/features/locale';
import { appName, metaTagList } from '@/features/metaTag';
import { appBaseUrl, i18nUrlList } from '@/features/url';
import { type Metadata, type NextPage } from 'next';

const language = 'ja';

export const metadata: Metadata = {
  title: metaTagList(language).top.title,
  description: metaTagList(language).top.description,
  openGraph: {
    title: metaTagList(language).top.title,
    description: metaTagList(language).top.description,
    url: metaTagList(language).top.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).top.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).top.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.top.ja,
    languages: {
      ja: i18nUrlList.top.ja,
      en: i18nUrlList.top.en,
    },
  },
};

const HomePage: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Hello new design!</h1>
    </main>
  );
};

export default HomePage;
