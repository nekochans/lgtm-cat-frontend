import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import { metaTagList } from '../constants/metaTag';
import { Image } from '../domain/types/image';
import extractRandomImages from '../infrastructures/utils/randomImages';
import imageData from '../infrastructures/utils/imageData';
import { useSetAppState } from '../stores/contexts/AppStateContext';
import ImageListContainer from '../containers/ImageLIst';

type Props = {
  imageList: Image[];
};

const IndexPage: React.FC<Props> = ({ imageList }: Props) => {
  const setAppState = useSetAppState();

  useEffect(() => {
    setAppState({ imageList, isFailedFetchImages: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout metaTag={metaTagList().top}>
      <ImageListContainer />
    </Layout>
  );
};

const imageLength = 9;

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => {
  const imageList: Image[] = extractRandomImages(imageData, imageLength);

  return {
    props: { imageList },
    revalidate: 3600,
  };
};

export default IndexPage;
