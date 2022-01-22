import React from 'react';

import ImageContext from './ImageContent';

export default {
  title: 'src/components/ImageContext.tsx',
  component: ImageContext,
  includeStories: ['showImageContextWithProps'],
};

export const testProps = {
  imageList: {
    id: 1,
    url: '/cat.jpeg',
  },
};

export const showImageContextWithProps = (): JSX.Element => (
  <ImageContext image={testProps.imageList} />
);
