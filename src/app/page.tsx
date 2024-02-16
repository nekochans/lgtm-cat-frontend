import { fetchLgtmImagesInRandom } from '@/api';
import type { Language, LgtmImage } from '@/features';
import { TopTemplate } from '@/templates';
import type { NextPage } from 'next';

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
};

const HomePage: NextPage<Props> = async () => {
  const revalidate = 3600;

  const lgtmImages = await fetchLgtmImagesInRandom(revalidate);

  return <TopTemplate language="ja" lgtmImages={lgtmImages} />;
};

export default HomePage;
