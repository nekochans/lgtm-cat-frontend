import * as Sentry from '@sentry/nextjs';
import { NextPage, NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import Link from 'next/link';
import React from 'react';

import ErrorContent from '../components/ErrorContent';
import ErrorLayout from '../components/ErrorLayout';
import { httpStatusCode, HttpStatusCode } from '../constants/httpStatusCode';
import { customErrorTitle } from '../constants/metaTag';
import { pathList } from '../constants/url';

type Props = {
  statusCode: HttpStatusCode;
  err?: Error;
  hasGetInitialPropsRun?: boolean;
};

const CustomError: NextPage<Props> = ({ err, hasGetInitialPropsRun }) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err);
  }

  return (
    <ErrorLayout title={customErrorTitle}>
      <ErrorContent
        title="Error"
        message="エラーが発生しました。お手数ですが、時間がたってから再度お試し下さい。"
        topLink={
          <Link href={pathList.top}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>TOPページへ</a>
          </Link>
        }
      />
    </ErrorLayout>
  );
};

const defaultTimeout = 2000;

CustomError.getInitialProps = async (
  context: NextPageContext,
): Promise<Props> => {
  const errorInitialProps = (await NextErrorComponent.getInitialProps(
    context,
  )) as Props;

  const { res, err, asPath } = context;

  errorInitialProps.hasGetInitialPropsRun = true;

  if (res?.statusCode === httpStatusCode.notFound) {
    return errorInitialProps;
  }

  if (err) {
    Sentry.captureException(err);

    await Sentry.flush(defaultTimeout);

    return errorInitialProps;
  }

  Sentry.captureException(
    new Error(`_error.tsx getInitialProps missing data at path: ${asPath}`),
  );
  await Sentry.flush(defaultTimeout);

  return errorInitialProps;
};

export default CustomError;
