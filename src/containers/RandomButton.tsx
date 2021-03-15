import React from 'react';
import { useRouter } from 'next/router';
import { urlList } from '../constants/url';
import { useSetAppState } from '../contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructure/repository/ImageRepository';
import RandomButton from '../components/RandomButton';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();
  const router = useRouter();

  const handleRandom = async () => {
    try {
      const imageList = await fetchRandomImageList();
      setAppState({ imageList: imageList.images });
    } catch (e) {
      await router.push(urlList.error);
    }
  };

  return <RandomButton handleRandom={handleRandom} />;
};

export default RandomButtonContainer;
