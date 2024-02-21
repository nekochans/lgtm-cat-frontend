import { isLanguage, type Language } from '@/features';
import { UploadTemplate } from '@/templates';
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    language: Language;
  };
};

const UploadPage: NextPage<Props> = ({ params }) => {
  if (!isLanguage(params.language)) {
    notFound();
  }

  return <UploadTemplate language={params.language} />;
};

export default UploadPage;
