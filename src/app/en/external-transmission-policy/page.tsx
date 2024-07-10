import fs from 'fs';
import { Footer, MarkdownContentsWrapper } from '@/components';
import {
  appName,
  convertLocaleToLanguage,
  createExternalTransmissionPolicyLinksFromLanguages,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { ExternalTransmissionTemplate } from '@/templates';
import type { Metadata, NextPage } from 'next';

const language = 'en';

export const metadata: Metadata = {
  title: metaTagList(language)['external-transmission-policy'].title,
  description:
    metaTagList(language)['external-transmission-policy'].description,
  openGraph: {
    title: metaTagList(language)['external-transmission-policy'].title,
    description:
      metaTagList(language)['external-transmission-policy'].description,
    url: metaTagList(language)['external-transmission-policy'].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)['external-transmission-policy'].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)['external-transmission-policy'].title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  alternates: {
    canonical: i18nUrlList['external-transmission-policy'].ja,
    languages: {
      ja: i18nUrlList['external-transmission-policy'].ja,
      en: i18nUrlList['external-transmission-policy'].en,
    },
  },
};

const ExternalTransmissionPage: NextPage = async () => {
  const fsPromise = fs.promises;

  const markdown = await fsPromise.readFile(
    `${process.cwd()}/src/docs/externalTransmission.en.md`,
    {
      encoding: 'utf8',
    },
  );

  const currentUrlPath =
    createExternalTransmissionPolicyLinksFromLanguages(language).link;

  return (
    <>
      <ExternalTransmissionTemplate
        language={language}
        currentUrlPath={currentUrlPath}
      >
        <MarkdownContentsWrapper
          type="externalTransmission"
          language={language}
          markdown={markdown}
        />
      </ExternalTransmissionTemplate>
      <Footer language={language} />
    </>
  );
};

export default ExternalTransmissionPage;
