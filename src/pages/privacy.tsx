import fs from 'fs';

import MarkdownContents from '../components/MarkdownContents';
import { metaTagList } from '../constants/metaTag';
import SimpleLayout from '../layouts/SimpleLayout';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  privacy: string;
};

const PrivacyPage: NextPage<Props> = ({ privacy }) => (
  <SimpleLayout metaTag={metaTagList().privacy}>
    <MarkdownContents markdown={privacy} />
  </SimpleLayout>
);

export const getStaticProps: GetStaticProps = async () => {
  const fsPromise = fs.promises;

  const privacy = await fsPromise.readFile(
    `${process.cwd()}/src/docs/privacy.md`,
    {
      encoding: 'utf8',
    },
  );

  return { props: { privacy } };
};

export default PrivacyPage;
