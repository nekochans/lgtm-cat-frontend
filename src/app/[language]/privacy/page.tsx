import fs from 'fs';
import { TermsOrPrivacyTemplate } from '@/templates';
import type { NextPage } from 'next';

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

  const language = 'en';

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
