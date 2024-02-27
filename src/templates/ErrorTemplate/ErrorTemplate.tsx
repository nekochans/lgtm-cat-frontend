'use client';

import {
  ErrorContent,
  InternalServerErrorImage,
  NotFoundImage,
  ResponsiveLayout,
  ServiceUnavailableImage,
} from '@/components';
import { httpStatusCode } from '@/constants';
import {
  type ErrorType,
  type IncludeLanguageAppPath,
  type Language,
} from '@/features';
import { useSwitchLanguage } from '@/hooks';
import { assertNever } from '@/utils';
import type { FC } from 'react';

type Props = {
  type: ErrorType;
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
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

export const ErrorTemplate: FC<Props> = ({
  type,
  language,
  currentUrlPath,
}) => {
  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  return (
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
  );
};
