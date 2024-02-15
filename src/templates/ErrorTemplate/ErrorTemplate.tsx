import {
  ErrorContent,
  InternalServerErrorImage,
  NotFoundImage,
  ResponsiveLayout,
  ServiceUnavailableImage,
} from '@/components';
import { httpStatusCode } from '@/constants';
import {
  custom404title,
  customErrorTitle,
  errorMetaTag,
  metaTagList,
  notFoundMetaTag,
  type ErrorType,
  type Language,
} from '@/features';
import { useSwitchLanguage } from '@/hooks';
import { ErrorLayout } from '@/layouts';
import { assertNever } from '@/utils';
import { useRouter } from 'next/router';
import type { FC } from 'react';

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

  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
    <ErrorLayout title={pageTitle(type, language)} metaTag={metaTag}>
      <div onClick={onClickOutSideMenu} aria-hidden="true">
        <ResponsiveLayout
          language={language}
          isLanguageMenuDisplayed={isLanguageMenuDisplayed}
          onClickLanguageButton={onClickLanguageButton}
          currentUrlPath={currentUrlPath}
        >
          <ErrorContent
            type={type}
            language={language}
            catImage={catImage(type)}
            shouldDisplayBackToTopButton={true}
          />
        </ResponsiveLayout>
      </div>
    </ErrorLayout>
  );
};
