import fs from 'fs';
import {
  appName,
  convertLocaleToLanguage,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { TermsOrPrivacyTemplate } from '@/templates';
import type { Metadata, NextPage } from 'next';

const language = 'en';

export const metadata: Metadata = {
  title: metaTagList(language).terms.title,
  description: metaTagList(language).terms.description,
  openGraph: {
    title: metaTagList(language).terms.title,
    description: metaTagList(language).terms.description,
    url: metaTagList(language).terms.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).terms.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).terms.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  alternates: {
    canonical: i18nUrlList.terms.en,
    languages: {
      ja: i18nUrlList.terms.ja,
      en: i18nUrlList.terms.en,
    },
  },
};

const TermsPage: NextPage = async () => {
  const fsPromise = fs.promises;

  const termsJa = await fsPromise.readFile(
    `${process.cwd()}/src/docs/terms.ja.md`,
    {
      encoding: 'utf8',
    },
  );

  const termsEn = await fsPromise.readFile(
    `${process.cwd()}/src/docs/terms.en.md`,
    {
      encoding: 'utf8',
    },
  );

  return (
    <TermsOrPrivacyTemplate
      type="terms"
      language={language}
      jaMarkdown={termsJa}
      enMarkdown={termsEn}
    />
  );
};

export default TermsPage;
