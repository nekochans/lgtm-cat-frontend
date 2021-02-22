import React from 'react';
import ImageRow from './ImageRow';

export default {
  title: 'src/components/ImageRow.tsx',
  component: ImageRow,
  includeStories: ['showImageRowWithProps'],
};

export const testProps = {
  imageList: [
    {
      id: 1,
      url: '/cat.jpeg',
    },
    {
      id: 2,
      url: '/cat2.jpeg',
    },
    {
      id: 3,
      url: '/cat.jpeg',
    },
  ],
};

export const showImageRowWithProps = (): JSX.Element => (
  <ImageRow imageList={testProps.imageList} />
);
