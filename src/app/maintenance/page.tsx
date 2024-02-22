import { httpStatusCode } from '@/constants';
import { createIncludeLanguageAppPath } from '@/features';
import { ErrorTemplate } from '@/templates';
import type { NextPage } from 'next';

const MaintenancePage: NextPage = () => {
  const language = 'ja';

  return (
    <ErrorTemplate
      type={httpStatusCode.serviceUnavailable}
      language={language}
      currentUrlPath={createIncludeLanguageAppPath('maintenance', language)}
    />
  );
};

export default MaintenancePage;
