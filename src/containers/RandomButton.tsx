import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import throttle from 'lodash/throttle';
import { useSetAppState } from '../stores/contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructures/repositories/api/fetch/imageRepository';
import RandomButton from '../components/RandomButton';
import { sendFetchRandomImages } from '../infrastructures/utils/gtag';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();

  const handleRandom = async () => {
    try {
      const lgtmImagesResponse = await fetchRandomImageList();
      setAppState({
        lgtmImages: lgtmImagesResponse.lgtmImages,
        isFailedFetchLgtmImages: false,
      });

      sendFetchRandomImages('fetch_random_images_button');
    } catch (e) {
      setAppState({ lgtmImages: [], isFailedFetchLgtmImages: true });
    }
  };
  const handleRandomThrottled = throttle(() => handleRandom(), 500);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
