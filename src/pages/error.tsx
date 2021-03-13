import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import SimpleLayout from '../components/SimpleLayout';
import { metaTagList } from '../constants/metaTag';
import Error from '../components/Error';
import { pathList } from '../constants/url';

const ErrorPage: NextPage = () => (
  <SimpleLayout metaTag={metaTagList().privacy}>
    <Error
      topLink={
        <Link href={pathList.top}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>TOPページへ</a>
        </Link>
      }
    />
  </SimpleLayout>
);

export default ErrorPage;
