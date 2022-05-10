import throttle from 'lodash/throttle';

import Button from '../components/Button';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { fetchLgtmImagesInRecentlyCreated } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRecentlyCreatedImages } from '../infrastructures/utils/gtm';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

import type { VFC } from 'react';

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
    sendFetchRecentlyCreatedImages('fetch_recently_created_images_button');
  };

  const limitThreshold = 500;
  const handleOnClickThrottled = throttle(
    () => handleOnClick(),
    limitThreshold,
  );

  return (
    <Button text="新着の猫ちゃんを表示" onClick={handleOnClickThrottled} />
  );
};

export default RecentlyCatFetchButtonContainer;
