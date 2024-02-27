import fs from 'fs';
import {
  appName,
  convertLocaleToLanguage,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { TermsOrPrivacyTemplate } from '@/templates';
import type { Metadata, NextPage } from 'next';

const language = 'ja';

export const metadata: Metadata = {
  title: metaTagList(language).privacy.title,
  description: metaTagList(language).privacy.description,
  openGraph: {
    title: metaTagList(language).privacy.title,
    description: metaTagList(language).privacy.description,
    url: metaTagList(language).privacy.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).privacy.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).privacy.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  alternates: {
    canonical: i18nUrlList.privacy.ja,
    languages: {
      ja: i18nUrlList.privacy.ja,
      en: i18nUrlList.privacy.en,
    },
  },
};

const PrivacyPage: NextPage = async () => {
  const fsPromise = fs.promises;

  const privacyJa = await fsPromise.readFile(
    `${process.cwd()}/src/docs/privacy.ja.md`,
    {
      encoding: 'utf8',
    },
  );

  const privacyEn = await fsPromise.readFile(
    `${process.cwd()}/src/docs/privacy.en.md`,
    {
      encoding: 'utf8',
    },
  );

  return (
    <TermsOrPrivacyTemplate
      type="privacy"
      language={language}
      jaMarkdown={privacyJa}
      enMarkdown={privacyEn}
    />
  );
};

export default PrivacyPage;
