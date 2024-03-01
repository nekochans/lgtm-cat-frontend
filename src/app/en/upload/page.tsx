import { Footer } from '@/components';
import {
  appName,
  convertLocaleToLanguage,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { UploadTemplate } from '@/templates';
import type { Metadata, NextPage } from 'next';

const language = 'en';

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
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  alternates: {
    canonical: i18nUrlList.upload.en,
    languages: {
      ja: i18nUrlList.upload.ja,
      en: i18nUrlList.upload.en,
    },
  },
};

const UploadPage: NextPage = () => {
  return (
    <>
      <UploadTemplate language={language} />
      <Footer language={language} />
    </>
  );
};

export default UploadPage;
