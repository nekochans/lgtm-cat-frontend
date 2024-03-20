import { fetchLgtmImagesInRandom } from '@/api';
import { Footer } from '@/components';
import { extractAppBaseUrlFromHeader } from '@/edge';
import { TopTemplate } from '@/templates';
import type { NextPage } from 'next';

const language = 'en';

const HomePage: NextPage = async () => {
  const revalidate = 3600;

  const appBaseUrl = extractAppBaseUrlFromHeader();

  const lgtmImages = await fetchLgtmImagesInRandom(appBaseUrl, revalidate);

  return (
    <>
      <TopTemplate
        language={language}
        lgtmImages={lgtmImages}
        appBaseUrl={appBaseUrl}
      />
      <Footer language={language} />
    </>
  );
};

export default HomePage;
