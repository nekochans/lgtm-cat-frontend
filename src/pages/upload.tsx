import React from 'react';
import { metaTagList } from '../constants/metaTag';
import DefaultLayout from '../layouts/DefaultLayout';
import CatImageUploadForm from '../components/CatImageUploadForm';

const UploadPage: React.FC = () => (
  <DefaultLayout metaTag={metaTagList().top}>
    <CatImageUploadForm />
  </DefaultLayout>
);

export default UploadPage;
