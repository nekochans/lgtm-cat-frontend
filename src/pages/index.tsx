import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import ImageList from '../components/ImageList';
import { metaTagList } from '../constants/metaTag';
import { Image } from '../domain/image';
import extractRandomImages from '../utils/randomImages';
import imageData from '../utils/imageData';

type Props = {
  imageList: Image[];
};

const IndexPage: React.FC<Props> = ({ imageList }: Props) => (
  <Layout metaTag={metaTagList().top}>
    <ImageList imageList={imageList} />
  </Layout>
);

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
