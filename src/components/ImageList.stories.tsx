import React from 'react';
import ImageList from './ImageList';

export default {
  title: 'src/components/ImageList.tsx',
  component: ImageList,
  includeStories: ['showImageListWithProps'],
};

export const showImageListWithProps = (): JSX.Element => <ImageList />;
