import { GetStaticProps } from 'next';
import React, { useEffect } from 'react';

import { metaTagList } from '../constants/metaTag';
import ImageListContainer from '../containers/ImageListContainer';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { LgtmImages } from '../domain/types/lgtmImage';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { fetchLgtmImagesInRandom } from '../infrastructures/repositories/api/fetch/imageRepository';
import imageData from '../infrastructures/utils/imageData';
import extractRandomImages from '../infrastructures/utils/randomImages';
import DefaultLayout from '../layouts/DefaultLayout';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

type Props = LgtmImages;

const IndexPage: React.FC<Props> = ({ lgtmImages }: Props) => {
  useEffect(() => {
    updateLgtmImages(lgtmImages);
    updateIsFailedFetchLgtmImages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout metaTag={metaTagList().top}>
      <ImageListContainer />
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const issueAccessTokenResult = await issueAccessToken();
  if (isSuccessResult(issueAccessTokenResult)) {
    const lgtmImagesResult = await fetchLgtmImagesInRandom({
      accessToken: { jwtString: issueAccessTokenResult.value.jwtString },
    });
    if (isSuccessResult(lgtmImagesResult)) {
      return {
        props: { lgtmImages: lgtmImagesResult.value.lgtmImages },
        revalidate: 3600,
      };
    }
  }

  /*
   * TODO ここに到達した場合、APIでエラーが起きているので通知を送るようにしたい
   * APIから取得に失敗した場合は静的ファイルに記載されたデータを取得する
   * 理由としてはエラー表示がCacheされる事を避ける為
   */
  const imageLength = 9;
  const lgtmImages = extractRandomImages(imageData, imageLength);

  return {
    props: { lgtmImages },
    revalidate: 3600,
  };
};

export default IndexPage;
