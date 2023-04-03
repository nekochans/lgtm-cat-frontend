import type { GetStaticProps, NextPage } from 'next';
import { convertLocaleToLanguage, type Language } from '@/features';
import { UploadTemplate } from '@/templates';

type Props = {
  language: Language;
};

const UploadPage: NextPage<Props> = ({ language }) => (
  <UploadTemplate language={language} />
);

export const getStaticProps: GetStaticProps = (context) => {
  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  return {
    props: { language },
  };
};

export default UploadPage;
