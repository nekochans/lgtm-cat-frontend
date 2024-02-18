import { fetchLgtmImagesInRandom } from '@/api';
import { TopTemplate } from '@/templates';
import type { NextPage } from 'next';

const HomePage: NextPage = async () => {
  const revalidate = 3600;

  const lgtmImages = await fetchLgtmImagesInRandom(revalidate);

  return <TopTemplate language="ja" lgtmImages={lgtmImages} />;
};

export default HomePage;
