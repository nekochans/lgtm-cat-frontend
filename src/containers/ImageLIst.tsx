import React from 'react';
import ImageList from '../components/ImageList';
import { useAppState } from '../contexts/AppStateContext';

const ImageListContainer: React.FC = () => {
  const state = useAppState();

  return <ImageList imageList={state.imageList} />;
};
export default ImageListContainer;
