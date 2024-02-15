import { convertLocaleToLanguage, type Language } from '@/features';
import { UploadTemplate } from '@/templates';
import {
  sendCopyMarkdownFromCopyButton,
  sendCopyMarkdownFromCreatedImage,
  sendUploadedCatImage,
} from '@/utils';
import type { GetStaticProps, NextPage } from 'next';

const callbackFunctions = {
  uploadCallback: sendUploadedCatImage,
  onClickCreatedLgtmImage: sendCopyMarkdownFromCreatedImage,
  onClickMarkdownSourceCopyButton: sendCopyMarkdownFromCopyButton,
};

type Props = {
  language: Language;
};

const UploadPage: NextPage<Props> = ({ language }) => (
  <UploadTemplate language={language} callbackFunctions={callbackFunctions} />
);

export const getStaticProps: GetStaticProps = (context) => {
  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  return {
    props: { language },
  };
};

export default UploadPage;
