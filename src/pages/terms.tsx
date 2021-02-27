import fs from 'fs';
import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import SimpleLayout from '../components/SimpleLayout';
import MarkdownContents from '../components/MarkdownContents';

type Props = {
  terms: string;
};

const TermsPage: NextPage<Props> = ({ terms }: Props) => (
  <SimpleLayout title="LGTMeow 利用規約">
    <MarkdownContents markdown={terms} />
  </SimpleLayout>
);

export const getStaticProps: GetStaticProps = async () => {
  const fsPromise = fs.promises;

  const terms = await fsPromise.readFile(`${process.cwd()}/src/docs/terms.md`, {
    encoding: 'utf8',
  });

  return { props: { terms } };
};

export default TermsPage;
