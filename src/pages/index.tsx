import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import DefaultLayout from '../layouts/DefaultLayout';
import { metaTagList } from '../constants/metaTag';
import { LgtmImage, LgtmImages } from '../domain/types/lgtmImage';
import extractRandomImages from '../infrastructures/utils/randomImages';
import imageData from '../infrastructures/utils/imageData';
import { useSetAppState } from '../stores/contexts/AppStateContext';
import ImageListContainer from '../containers/ImageLIst';

type Props = LgtmImages;

const IndexPage: React.FC<Props> = ({ lgtmImages }: Props) => {
  const setAppState = useSetAppState();

  useEffect(() => {
    setAppState({ lgtmImages, isFailedFetchLgtmImages: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout metaTag={metaTagList().top}>
      <ImageListContainer />
    </DefaultLayout>
  );
};

const imageLength = 9;

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => {
  const lgtmImages: LgtmImage[] = extractRandomImages(imageData, imageLength);

  return {
    props: { lgtmImages },
    revalidate: 3600,
  };
};

export default IndexPage;
