import React from 'react';
import { urlList } from '../constants/url';
import { useSetAppState } from '../contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructure/repository/ImageRepository';
import RandomButton from '../components/RandomButton';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();

  const handleRandom = async () => {
    try {
      const imageList = await fetchRandomImageList();
      setAppState({ imageList: imageList.images });
    } catch (e) {
      if (window) {
        window.location.href = urlList.error;
      }
    }
  };

  return <RandomButton handleRandom={handleRandom} />;
};

export default RandomButtonContainer;
