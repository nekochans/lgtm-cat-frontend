import fs from 'fs';
import { TermsOrPrivacyTemplate } from '@/templates';
import type { NextPage } from 'next';

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
      language="en"
      jaMarkdown={termsJa}
      enMarkdown={termsEn}
    />
  );
};

export default TermsPage;
