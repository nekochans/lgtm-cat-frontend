import { UploadTemplate } from '@/templates';
import type { NextPage } from 'next';

const UploadPage: NextPage = () => {
  const language = 'ja';

  return <UploadTemplate language={language} />;
};

export default UploadPage;
