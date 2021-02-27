import fs from 'fs';
import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import Layout from '../components/Layout';
import MarkdownContents from '../components/MarkdownContents';

type Props = {
  privacy: string;
};

const PrivacyPage: NextPage<Props> = ({ privacy }: Props) => (
  <Layout title="LGTMeow プライバシーポリシー">
    <MarkdownContents markdown={privacy} />
  </Layout>
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
