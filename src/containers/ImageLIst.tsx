import React from 'react';
import Link from 'next/link';
import ImageList from '../components/ImageList';
import { useAppState } from '../stores/contexts/AppStateContext';
import Error from '../components/Error';
import { pathList } from '../constants/url';

const ImageListContainer: React.FC = () => {
  const state = useAppState();

  if (state.isFailedFetchImages) {
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

  return <ImageList imageList={state.imageList} />;
};
export default ImageListContainer;
