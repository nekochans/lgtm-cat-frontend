// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'jest-fetch-mock';
import { uploadCatImage } from '../../imageRepository';
import { UploadCatImageRequest } from '../../../../../../domain/repositories/imageRepository';

describe('imageRepository.ts uploadCatImage TestCases', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should return the LGTM image URL', async () => {
    const mockBody = {
      imageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    };

    const mockParams = {
      status: 202,
      statusText: 'Accepted',
    };

    fetch.mockResponseOnce(JSON.stringify(mockBody), mockParams);

    const request: UploadCatImageRequest = {
      image: '',
      imageExtension: '.jpg',
    };

    const uploadedImage = await uploadCatImage(request);

    expect(uploadedImage).toStrictEqual(mockBody);
  });
});
