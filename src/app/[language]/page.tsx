import { fetchLgtmImagesInRandom } from '@/api';
import { isLanguage, type Language } from '@/features';
import { TopTemplate } from '@/templates';
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    language: Language;
  };
};

const HomePage: NextPage<Props> = async ({ params }) => {
  if (!isLanguage(params.language)) {
    notFound();
  }

  const revalidate = 3600;

  const lgtmImages = await fetchLgtmImagesInRandom(revalidate);

  return <TopTemplate language={params.language} lgtmImages={lgtmImages} />;
};

export default HomePage;
