import fs from 'fs';
import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import SimpleLayout from '../components/SimpleLayout';
import MarkdownContents from '../components/MarkdownContents';
import { metaTagList } from '../constants/metaTag';

type Props = {
  privacy: string;
};

const PrivacyPage: NextPage<Props> = ({ privacy }: Props) => (
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
