import React from 'react';
import { metaTagList } from '../constants/metaTag';
import CatImageUploadForm from '../components/CatImageUploadForm';
import SimpleLayout from '../layouts/SimpleLayout';

const UploadPage: React.FC = () => (
  <SimpleLayout metaTag={metaTagList().top}>
    <CatImageUploadForm />
  </SimpleLayout>
);

export default UploadPage;
