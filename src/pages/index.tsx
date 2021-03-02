import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import { LgtmImage, sampleLgtmData } from '../utils/sampleLtgmData';
import ImageList from '../components/ImageList';
import { metaTagList } from '../constants/metaTag';

type Props = {
  imageList: LgtmImage[];
};

const IndexPage: React.FC<Props> = ({ imageList }: Props) => (
  <Layout metaTag={metaTagList().top}>
    <ImageList imageList={imageList} />
  </Layout>
);

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => {
  const imageList: LgtmImage[] = sampleLgtmData;

  return { props: { imageList } };
};

export default IndexPage;
