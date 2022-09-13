import fs from 'fs';

import { convertLocaleToLanguage, type Language } from '../features';
import { TermsOrPrivacyTemplate } from '../templates';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  language: Language;
  termsJa: string;
  termsEn: string;
};

const TermsPage: NextPage<Props> = ({ language, termsJa, termsEn }) => (
  <TermsOrPrivacyTemplate
    type="terms"
    language={language}
    jaMarkdown={termsJa}
    enMarkdown={termsEn}
  />
);

export const getStaticProps: GetStaticProps = async (context) => {
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

  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  return { props: { language, termsJa, termsEn } };
};

export default TermsPage;
