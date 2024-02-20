import { UploadTemplate } from '@/templates';
import type { NextPage } from 'next';

const UploadPage: NextPage = () => {
  const language = 'en';

  return <UploadTemplate language={language} />;
};

export default UploadPage;
