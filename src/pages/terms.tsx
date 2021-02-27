import fs from 'fs';
import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import Layout from '../components/Layout';
import MarkdownContents from '../components/MarkdownContents';

type Props = {
  terms: string;
};

const TermsPage: NextPage<Props> = ({ terms }: Props) => (
  <Layout title="LGTMeow 利用規約">
    <MarkdownContents markdown={terms} />
  </Layout>
);

export const getStaticProps: GetStaticProps = async () => {
  const fsPromise = fs.promises;

  const terms = await fsPromise.readFile(`${process.cwd()}/src/docs/terms.md`, {
    encoding: 'utf8',
  });

  return { props: { terms } };
};

export default TermsPage;
