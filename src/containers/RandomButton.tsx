import throttle from 'lodash/throttle';
import React from 'react';

import RandomButton from '../components/RandomButton';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { fetchLgtmImagesInRandom } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRandomImages } from '../infrastructures/utils/gtm';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

const RandomButtonContainer: React.FC = () => {
  const handleRandom = async () => {
    const issueAccessTokenResult = await issueAccessToken();
    if (!isSuccessResult(issueAccessTokenResult)) {
      updateLgtmImages([]);
      updateIsFailedFetchLgtmImages(true);

      return;
    }

    const lgtmImagesResponse = await fetchLgtmImagesInRandom({
      accessToken: { jwtString: issueAccessTokenResult.value.jwtString },
    });

    if (!isSuccessResult(lgtmImagesResponse)) {
      updateLgtmImages([]);
      updateIsFailedFetchLgtmImages(true);

      return;
    }

    updateLgtmImages(lgtmImagesResponse.value.lgtmImages);
    updateIsFailedFetchLgtmImages(false);
    sendFetchRandomImages('fetch_random_images_button');
  };

  const limitThreshold = 500;
  const handleRandomThrottled = throttle(() => handleRandom(), limitThreshold);

  return <RandomButton handleRandom={handleRandomThrottled} />;
};

export default RandomButtonContainer;
