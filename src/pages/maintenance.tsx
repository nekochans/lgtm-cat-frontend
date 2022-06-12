import { NextPage } from 'next';
import Link from 'next/link';

import ErrorContent from '../components/ErrorContent';
import ErrorLayout from '../components/ErrorLayout';
import { metaTagList } from '../constants/metaTag';
import { pathList } from '../constants/url';

const MaintenancePage: NextPage = () => (
  <ErrorLayout title={metaTagList().maintenance.title}>
    <ErrorContent
      title="システムメンテナンス"
      message="メンテナンス中です。申し訳ありませんがしばらく時間がたってからお試しください。"
      topLink={
        <Link href={pathList.top}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>TOPページへ</a>
        </Link>
      }
    />
  </ErrorLayout>
);

export default MaintenancePage;
