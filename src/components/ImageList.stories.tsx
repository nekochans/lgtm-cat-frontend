import React from 'react';

import ImageList from './ImageList';

export default {
  title: 'src/components/ImageList.tsx',
  component: ImageList,
  includeStories: ['showImageListWithProps'],
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
    {
      id: 4,
      url: '/cat2.jpeg',
    },
    {
      id: 5,
      url: '/cat.jpeg',
    },
    {
      id: 6,
      url: '/cat2.jpeg',
    },
    {
      id: 7,
      url: '/cat.jpeg',
    },
    {
      id: 8,
      url: '/cat2.jpeg',
    },
    {
      id: 9,
      url: '/cat.jpeg',
    },
  ],
};

export const showImageListWithProps = (): JSX.Element => (
  <ImageList lgtmImages={testProps.imageList} />
);
