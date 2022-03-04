import throttle from 'lodash/throttle';
import React from 'react';

import RandomButton from '../components/RandomButton';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { fetchLgtmImagesInRandomWithClient } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRandomImages } from '../infrastructures/utils/gtm';
import { useSetAppState } from '../stores/contexts/AppStateContext';

const RandomButtonContainer: React.FC = () => {
  const setAppState = useSetAppState();

  const handleRandom = async () => {
    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    if (isSuccessResult(lgtmImagesResponse)) {
      setAppState({
        lgtmImages: lgtmImagesResponse.value.lgtmImages,
        isFailedFetchLgtmImages: false,
      });

      sendFetchRandomImages('fetch_random_images_button');
    } else {
      setAppState({ lgtmImages: [], isFailedFetchLgtmImages: true });
    }
  };

  const limitThreshold = 500;
  const handleRandomThrottled = throttle(() => handleRandom(), limitThreshold);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
