import fs from 'fs';

import MarkdownContents from '../components/MarkdownContents';
import { metaTagList } from '../constants/metaTag';
import SimpleLayout from '../layouts/SimpleLayout';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  terms: string;
};

const TermsPage: NextPage<Props> = ({ terms }: Props) => (
  <SimpleLayout metaTag={metaTagList().terms}>
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
