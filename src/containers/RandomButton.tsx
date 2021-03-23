import React from 'react';
import { useRouter } from 'next/router';
import { urlList } from '../constants/url';
import { useSetAppState } from '../contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructure/repository/ImageRepository';
import RandomButton from '../components/RandomButton';
import * as gtag from '../utils/gtag';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();
  const router = useRouter();

  const handleRandom = async () => {
    try {
      const imageList = await fetchRandomImageList();
      setAppState({ imageList: imageList.images });

      gtag.event({
        action: 'click',
        category: 'fetch_random_images',
        label: 'fetch_random_images_button',
        value: 1,
      });
    } catch (e) {
      await router.push(urlList.error);
    }
  };

  return <RandomButton handleRandom={handleRandom} />;
};

export default RandomButtonContainer;
