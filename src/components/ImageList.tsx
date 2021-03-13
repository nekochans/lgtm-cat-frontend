import React from 'react';
import ImageRow from './ImageRow';
import { useAppState } from '../contexts/AppStateContext';

const ImageList: React.FC = () => {
  const state = useAppState();

  return (
    <section>
      <div className="container">
        <ImageRow imageList={state.imageList.slice(0, 3)} />
        <ImageRow imageList={state.imageList.slice(3, 6)} />
        <ImageRow imageList={state.imageList.slice(6, 9)} />
      </div>
    </section>
  );
};
export default ImageList;
