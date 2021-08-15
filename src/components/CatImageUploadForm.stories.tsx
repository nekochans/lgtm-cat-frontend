import React from 'react';
import CatImageUploadForm from './CatImageUploadForm';
import { UploadCatImage } from '../domain/repositories/imageRepository';

export default {
  title: 'src/components/CatImageUploadForm.tsx',
  component: Error,
  includeStories: ['showCatImageUploadForm'],
};

const mockUploadCatImage: UploadCatImage = (_request) =>
  Promise.resolve({
    imageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/00/35afef75-2d6d-4ca1-ab00-fb37f8848fca.webp',
  });

export const showCatImageUploadForm = (): JSX.Element => (
  <CatImageUploadForm uploadCatImage={mockUploadCatImage} />
);
