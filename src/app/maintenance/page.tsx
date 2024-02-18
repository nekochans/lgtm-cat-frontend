import { httpStatusCode } from '@/constants';
import { ErrorTemplate } from '@/templates';
import type { NextPage } from 'next';

const MaintenancePage: NextPage = () => {
  const language = 'ja';

  return (
    <ErrorTemplate
      type={httpStatusCode.serviceUnavailable}
      language={language}
    />
  );
};

export default MaintenancePage;
