import { httpStatusCode } from '../constants';
import { convertLocaleToLanguage, type Language } from '../features';
import { ErrorTemplate } from '../templates';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  language: Language;
};

const Custom404: NextPage<Props> = ({ language }) => (
  <ErrorTemplate type={httpStatusCode.notFound} language={language} />
);

export const getStaticProps: GetStaticProps = (context) => {
  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  return {
    props: { language },
  };
};

export default Custom404;
