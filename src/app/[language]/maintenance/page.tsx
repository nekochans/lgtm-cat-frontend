import { httpStatusCode } from '@/constants';
import {
  createIncludeLanguageAppPath,
  isLanguage,
  type Language,
} from '@/features';
import { ErrorTemplate } from '@/templates';
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    language: Language;
  };
};

const MaintenancePage: NextPage<Props> = ({ params }) => {
  if (!isLanguage(params.language)) {
    notFound();
  }

  return (
    <ErrorTemplate
      type={httpStatusCode.serviceUnavailable}
      language={params.language}
      currentUrlPath={createIncludeLanguageAppPath(
        'maintenance',
        params.language,
      )}
    />
  );
};

export default MaintenancePage;
