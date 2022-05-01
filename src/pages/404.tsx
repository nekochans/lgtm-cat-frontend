import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

import ErrorContent from '../components/ErrorContent';
import ErrorLayout from '../components/ErrorLayout';
import { custom404title } from '../constants/metaTag';
import { pathList } from '../constants/url';

const Custom404: NextPage = () => (
  <ErrorLayout title={custom404title}>
    <ErrorContent
      title="404"
      message={
        <p>
          お探しのページが見つかりません。
          <br />
          URLが間違っている、もしくは移動または削除された可能性があります。
        </p>
      }
      topLink={
        <Link href={pathList.top}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>TOPページへ</a>
        </Link>
      }
    />
  </ErrorLayout>
);

export default Custom404;
