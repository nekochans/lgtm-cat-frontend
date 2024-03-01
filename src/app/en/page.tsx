import { fetchLgtmImagesInRandom } from '@/api';
import { Footer } from '@/components';
import { TopTemplate } from '@/templates';
import type { NextPage } from 'next';

const language = 'en';

const HomePage: NextPage = async () => {
  const revalidate = 3600;

  const lgtmImages = await fetchLgtmImagesInRandom(revalidate);

  return (
    <>
      <TopTemplate language={language} lgtmImages={lgtmImages} />
      <Footer language={language} />
    </>
  );
};

export default HomePage;
