import fs from 'fs';

import { convertLocaleToLanguage, type Language } from '../features';
import { TermsOrPrivacyTemplate } from '../templates';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  language: Language;
  privacyJa: string;
  privacyEn: string;
};

const PrivacyPage: NextPage<Props> = ({ language, privacyJa, privacyEn }) => (
  <TermsOrPrivacyTemplate
    type="privacy"
    language={language}
    jaMarkdown={privacyJa}
    enMarkdown={privacyEn}
  />
);

export const getStaticProps: GetStaticProps = async (context) => {
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

  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  return { props: { language, privacyJa, privacyEn } };
};

export default PrivacyPage;
