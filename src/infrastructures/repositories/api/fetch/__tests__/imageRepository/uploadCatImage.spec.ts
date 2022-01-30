/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { apiList } from '../../../../../../constants/url';
import { UploadCatImageRequest } from '../../../../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockUploadCatImage from '../../../../../../mocks/api/lgtm/images/mockUploadCatImage';
import { uploadCatImage } from '../../imageRepository';

const mockHandlers = [rest.post(apiList.uploadCatImage, mockUploadCatImage)];

const mockServer = setupServer(...mockHandlers);

describe('imageRepository.ts uploadCatImage TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  it('should return the LGTM image URL', async () => {
    const expected = {
      imageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    };

    const request: UploadCatImageRequest = {
      image: '',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeTruthy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });

  // TODO 異常系のテストケースを実装
});
