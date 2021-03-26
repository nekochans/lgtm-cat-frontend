import React from 'react';
import { useRouter } from 'next/router';
// eslint-disable-next-line import/no-extraneous-dependencies
import throttle from 'lodash/throttle';
import { urlList } from '../constants/url';
import { useSetAppState } from '../contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructure/repository/ImageRepository';
import RandomButton from '../components/RandomButton';
import { sendFetchRandomImages } from '../utils/gtag';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();
  const router = useRouter();

  const handleRandom = async () => {
    try {
      const imageList = await fetchRandomImageList();
      setAppState({ imageList: imageList.images });

      sendFetchRandomImages('fetch_random_images_button');
    } catch (e) {
      await router.push(urlList.error);
    }
  };
  const handleRandomThrottled = throttle(() => handleRandom(), 500);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
