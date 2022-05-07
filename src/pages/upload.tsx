import CatImageUploadForm from '../components/CatImageUploadForm';
import { metaTagList } from '../constants/metaTag';
import { uploadCatImage } from '../infrastructures/repositories/api/fetch/imageRepository';
import SimpleLayout from '../layouts/SimpleLayout';

import type { NextPage } from 'next';

const UploadPage: NextPage = () => (
  <SimpleLayout metaTag={metaTagList().top}>
    <CatImageUploadForm uploadCatImage={uploadCatImage} />
  </SimpleLayout>
);

export default UploadPage;
