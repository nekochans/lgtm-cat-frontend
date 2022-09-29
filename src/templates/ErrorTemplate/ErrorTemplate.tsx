import type { FC } from 'react';
import {
  ErrorTemplate as OrgErrorTemplate,
  type ErrorType,
} from '@nekochans/lgtm-cat-ui';
import { useRouter } from 'next/router';

import {
  InternalServerErrorImage,
  NotFoundImage,
  ServiceUnavailableImage,
} from '../../components';
import { httpStatusCode } from '../../constants';
import {
  custom404title,
  customErrorTitle,
  metaTagList,
  notFoundMetaTag,
  errorMetaTag,
  type Language,
} from '../../features';
import { ErrorLayout } from '../../layouts';
import { assertNever } from '../../utils';

type Props = {
  type: ErrorType;
  language: Language;
};

const catImage = (type: ErrorType): JSX.Element => {
  switch (type) {
    case httpStatusCode.notFound:
      return <NotFoundImage />;
    case httpStatusCode.internalServerError:
      return <InternalServerErrorImage />;
    case httpStatusCode.serviceUnavailable:
      return <ServiceUnavailableImage />;
    default:
      return assertNever(type);
  }
};

const pageTitle = (type: ErrorType, language: Language) => {
  switch (type) {
    case httpStatusCode.notFound:
      return custom404title(language);
    case httpStatusCode.internalServerError:
      return customErrorTitle(language);
    case httpStatusCode.serviceUnavailable:
      return metaTagList(language).maintenance.title;
    default:
      return assertNever(type);
  }
};

const getMetaTag = (type: ErrorType, language: Language) => {
  switch (type) {
    case httpStatusCode.notFound:
      return notFoundMetaTag(language);
    case httpStatusCode.internalServerError:
      return errorMetaTag(language);
    case httpStatusCode.serviceUnavailable:
      return metaTagList(language).maintenance;
    default:
      return assertNever(type);
  }
};

export const ErrorTemplate: FC<Props> = ({ type, language }) => {
  const metaTag = getMetaTag(type, language);

  const router = useRouter();

  const currentUrlPath = router.pathname;

  return (
    <ErrorLayout title={pageTitle(type, language)} metaTag={metaTag}>
      <OrgErrorTemplate
        type={type}
        language={language}
        catImage={catImage(type)}
        shouldDisplayBackToTopButton={true}
        currentUrlPath={currentUrlPath}
      />
    </ErrorLayout>
  );
};
