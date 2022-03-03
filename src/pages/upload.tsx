import React from 'react';

import CatImageUploadForm from '../components/CatImageUploadForm';
import { metaTagList } from '../constants/metaTag';
import { uploadCatImage } from '../infrastructures/repositories/api/fetch/imageRepository';
import SimpleLayout from '../layouts/SimpleLayout';

const UploadPage: React.FC = () => (
  <SimpleLayout metaTag={metaTagList().top}>
    <CatImageUploadForm uploadCatImage={uploadCatImage} />
  </SimpleLayout>
);

export default UploadPage;
