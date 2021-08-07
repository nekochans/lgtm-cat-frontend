import React from 'react';
import { metaTagList } from '../constants/metaTag';
import CatImageUploadForm from '../components/CatImageUploadForm';
import SimpleLayout from '../layouts/SimpleLayout';
import { uploadCatImage } from '../infrastructures/repositories/api/fetch/ImageRepository';

const UploadPage: React.FC = () => (
  <SimpleLayout metaTag={metaTagList().top}>
    <CatImageUploadForm uploadCatImage={uploadCatImage} />
  </SimpleLayout>
);

export default UploadPage;
