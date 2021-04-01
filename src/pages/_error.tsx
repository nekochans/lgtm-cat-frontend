import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Error from '../components/Error';
import { pathList } from '../constants/url';
import ErrorLayout from '../components/ErrorLayout';
import { customErrorTitle } from '../constants/metaTag';

const CustomError: NextPage = () => (
  <ErrorLayout title={customErrorTitle}>
    <Error
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

export default CustomError;
