import fs from 'fs';
import { isLanguage, type Language } from '@/features';
import { TermsOrPrivacyTemplate } from '@/templates';
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    language: Language;
  };
};

const TermsPage: NextPage<Props> = async ({ params }) => {
  if (!isLanguage(params.language)) {
    notFound();
  }

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
      language={params.language}
      jaMarkdown={termsJa}
      enMarkdown={termsEn}
    />
  );
};

export default TermsPage;
