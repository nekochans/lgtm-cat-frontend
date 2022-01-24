import fetchMock from 'fetch-mock-jest';

import { apiList } from '../../../../../../constants/url';
import { UploadCatImageRequest } from '../../../../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import { uploadCatImage } from '../../imageRepository';

describe('imageRepository.ts uploadCatImage TestCases', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('should return the LGTM image URL', async () => {
    const mockBody = {
      imageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    };

    fetchMock.post(apiList.uploadCatImage, { status: 202, body: mockBody });

    const request: UploadCatImageRequest = {
      image: '',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeTruthy();
    expect(uploadedImageResult.value).toStrictEqual(mockBody);
  });

  // TODO 異常系のテストケースを実装
});
