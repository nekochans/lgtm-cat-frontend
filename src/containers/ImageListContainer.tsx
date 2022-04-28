import Link from 'next/link';
import React from 'react';
import { useSnapshot } from 'valtio';

import ErrorContent from '../components/ErrorContent';
import ImageList from '../components/ImageList';
import { pathList } from '../constants/url';
import { LgtmImage } from '../domain/types/lgtmImage';
import { lgtmImageStateSelector } from '../stores/valtio/lgtmImages';

const ImageListContainer: React.FC = () => {
  const snap = useSnapshot(lgtmImageStateSelector());

  if (snap.isFailedFetchLgtmImages) {
    return (
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
    );
  }

  return <ImageList lgtmImages={snap.lgtmImages as LgtmImage[]} />;
};
export default ImageListContainer;
