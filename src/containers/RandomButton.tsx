import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import throttle from 'lodash/throttle';
import { useSetAppState } from '../stores/contexts/AppStateContext';
import { fetchLgtmImagesInRandomWithClient } from '../infrastructures/repositories/api/fetch/imageRepository';
import RandomButton from '../components/RandomButton';
import { sendFetchRandomImages } from '../infrastructures/utils/gtag';
import { isSuccessResult } from '../domain/repositories/repositoryResult';

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
  const handleRandomThrottled = throttle(() => handleRandom(), 500);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
