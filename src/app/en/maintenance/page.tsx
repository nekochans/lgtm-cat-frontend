import { httpStatusCode } from '@/constants';
import {
  appName,
  convertLocaleToLanguage,
  createIncludeLanguageAppPath,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { ErrorTemplate } from '@/templates';
import type { Metadata, NextPage } from 'next';

const language = 'en';

export const metadata: Metadata = {
  title: metaTagList(language).maintenance.title,
  description: metaTagList(language).maintenance.description,
  openGraph: {
    title: metaTagList(language).maintenance.title,
    description: metaTagList(language).maintenance.description,
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
    type: 'website',
  },
  alternates: {
    canonical: i18nUrlList.maintenance.en,
    languages: {
      ja: i18nUrlList.maintenance.ja,
      en: i18nUrlList.maintenance.en,
    },
  },
};

const MaintenancePage: NextPage = () => {
  return (
    <ErrorTemplate
      type={httpStatusCode.serviceUnavailable}
      language={language}
      currentUrlPath={createIncludeLanguageAppPath('maintenance', language)}
    />
  );
};

export default MaintenancePage;
