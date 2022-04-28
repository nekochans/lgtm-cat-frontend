import throttle from 'lodash/throttle';
import React from 'react';

import Button from '../components/Button';
import FetchLgtmImagesAuthError from '../domain/errors/FetchLgtmImagesAuthError';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { fetchLgtmImagesInRandom } from '../infrastructures/repositories/api/fetch/imageRepository';
import { sendFetchRandomImages } from '../infrastructures/utils/gtm';
import {
  updateIsFailedFetchLgtmImages,
  updateLgtmImages,
} from '../stores/valtio/lgtmImages';

const RandomCatFetchButtonContainer: React.FC = () => {
  const handleRandom = async () => {
    const issueAccessTokenResult = await issueAccessToken();
    if (!isSuccessResult(issueAccessTokenResult)) {
      updateLgtmImages([]);
      updateIsFailedFetchLgtmImages(true);

      return;
    }

    // TODO デバッグ用のコードなので用事が終わったら削除する
    if (issueAccessTokenResult.value.jwtString) {
      throw new FetchLgtmImagesAuthError('fetch_random_images_button Error!!!');
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

  return <Button text="他の猫ちゃんを表示" onClick={handleRandomThrottled} />;
};

export default RandomCatFetchButtonContainer;
