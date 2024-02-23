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

const PrivacyPage: NextPage<Props> = async ({ params }) => {
  if (!isLanguage(params.language)) {
    notFound();
  }

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
      language={params.language}
      jaMarkdown={privacyJa}
      enMarkdown={privacyEn}
    />
  );
};

export default PrivacyPage;
