import throttle from 'lodash/throttle';
import React from 'react';

import RandomButton from '../components/RandomButton';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { fetchLgtmImagesInRandomWithClient } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRandomImages } from '../infrastructures/utils/gtm';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

const RandomButtonContainer: React.FC = () => {
  const handleRandom = async () => {
    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    if (isSuccessResult(lgtmImagesResponse)) {
      updateLgtmImages(lgtmImagesResponse.value.lgtmImages);
      updateIsFailedFetchLgtmImages(false);

      sendFetchRandomImages('fetch_random_images_button');
    } else {
      updateLgtmImages([]);
      updateIsFailedFetchLgtmImages(true);
    }
  };

  const limitThreshold = 500;
  const handleRandomThrottled = throttle(() => handleRandom(), limitThreshold);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
