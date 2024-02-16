import { httpStatusCode } from '@/constants';
import { ErrorTemplate } from '@/templates';
import type { JSX } from 'react';

const NotFound = (): JSX.Element => {
  // TODO 後でi18n対応を実施する
  return <ErrorTemplate type={httpStatusCode.notFound} language="ja" />;
};

export default NotFound;
