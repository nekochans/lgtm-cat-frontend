import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import ImageList from '../components/ImageList';
import { metaTagList } from '../constants/metaTag';
import { Image } from '../domain/image';
import extractRandomImages from '../utils/randomImages';
import imageData from '../utils/imageData';
import { useSetAppState } from '../contexts/AppStateContext';

type Props = {
  imageList: Image[];
};

const IndexPage: React.FC<Props> = ({ imageList }: Props) => {
  const setAppState = useSetAppState();
  setAppState({ imageList });

  return (
    <Layout metaTag={metaTagList().top}>
      <ImageList />
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
