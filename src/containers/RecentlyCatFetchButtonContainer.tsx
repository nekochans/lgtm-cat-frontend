import throttle from 'lodash/throttle';
import React, { VFC } from 'react';

import RecentlyCatFetchButton from '../components/RecentlyCatFetchButton';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { fetchLgtmImagesInRecentlyCreated } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRandomImages } from '../infrastructures/utils/gtm';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

const RecentlyCatFetchButtonContainer: VFC = () => {
  const handleOnClick = async () => {
    const issueAccessTokenResult = await issueAccessToken();
    if (!isSuccessResult(issueAccessTokenResult)) {
      updateLgtmImages([]);
      updateIsFailedFetchLgtmImages(true);

      return;
    }

    const lgtmImagesResponse = await fetchLgtmImagesInRecentlyCreated({
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
  const handleOnClickThrottled = throttle(
    () => handleOnClick(),
    limitThreshold,
  );

  return <RecentlyCatFetchButton handleOnClick={handleOnClickThrottled} />;
};

export default RecentlyCatFetchButtonContainer;
