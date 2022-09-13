import { issueAccessTokenOnServer, fetchLgtmImagesInRandom } from '../api';
import {
  convertLocaleToLanguage,
  extractRandomImages,
  type Language,
  LgtmImage,
} from '../features';
import { TopTemplate } from '../templates';

import type { GetStaticProps, NextPage } from 'next';

type Props = {
  language: Language;
  lgtmImages: LgtmImage[];
};

const IndexPage: NextPage<Props> = ({ language, lgtmImages }) => (
  <TopTemplate language={language} lgtmImages={lgtmImages} />
);

// eslint-disable-next-line max-statements
export const getStaticProps: GetStaticProps = async (context) => {
  const revalidate = 3600;

  const { locale } = context;
  const language = convertLocaleToLanguage(locale);

  try {
    const accessToken = await issueAccessTokenOnServer();

    const lgtmImages = await fetchLgtmImagesInRandom({ accessToken });

    return {
      props: { language, lgtmImages },
      revalidate,
    };
  } catch (error) {
    // APIから取得に失敗した場合は静的ファイルに記載されたデータを取得する
    // 理由としてはエラー表示がCacheされる事を避ける為
    const imageLength = 9;
    const lgtmImages = extractRandomImages(imageLength);

    return {
      props: { language, lgtmImages },
      revalidate,
    };
  }
};

export default IndexPage;
