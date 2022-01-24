import Link from 'next/link';
import React from 'react';

import Error from '../components/Error';
import ImageList from '../components/ImageList';
import { pathList } from '../constants/url';
import { useAppState } from '../stores/contexts/AppStateContext';

const ImageListContainer: React.FC = () => {
  const state = useAppState();

  if (state.isFailedFetchLgtmImages) {
    return (
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
    );
  }

  return <ImageList lgtmImages={state.lgtmImages} />;
};
export default ImageListContainer;
