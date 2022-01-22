import { GetServerSidePropsContext } from 'next';

import generateSitemapXml from '../infrastructures/utils/generateSitemapXml';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({
  res,
}: // eslint-disable-next-line require-await
GetServerSidePropsContext) => {
  const xml = generateSitemapXml();

  res.statusCode = 200;
  // 24時間キャッシュさせる、もっと長くても良いかも
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/xml');
  res.end(xml);

  return {
    props: {},
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SitemapPage = () => null;

export default SitemapPage;
