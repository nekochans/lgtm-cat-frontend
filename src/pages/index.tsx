import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import ImageList from '../components/ImageList';
import { urlList } from '../constants/url';
import { Image } from '../domain/image';

type Props = {
  imageList: Image[];
};

const IndexPage: React.FC<Props> = ({ imageList }: Props) => (
  <Layout title="LGTMeow">
    <ImageList imageList={imageList} />
  </Layout>
);

export const getStaticProps: GetStaticProps = async () => {
  type ImagesResponse = {
    images: Image[];
  };

  const response = (await fetch(`${urlList.top}/api/lgtm/images`).then((r) =>
    r.json(),
  )) as ImagesResponse;

  const imageList: Image[] = response.images;

  return {
    props: { imageList },
    revalidate: 3600,
  };
};

export default IndexPage;
