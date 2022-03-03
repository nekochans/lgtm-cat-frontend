/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  apiList,
  cognitoTokenEndpointUrl,
} from '../../../../../../constants/url';
import UploadCatImageAuthError from '../../../../../../domain/errors/UploadCatImageAuthError';
import UploadCatImageSizeTooLargeError from '../../../../../../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageUnexpectedError from '../../../../../../domain/errors/UploadCatImageUnexpectedError';
import UploadCatImageValidationError from '../../../../../../domain/errors/UploadCatImageValidationError';
import { UploadCatImageRequest } from '../../../../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockTokenEndpoint from '../../../../../../mocks/api/external/cognito/mockTokenEndpoint';
import mockUploadCatImage from '../../../../../../mocks/api/lgtm/images/mockUploadCatImage';
import mockUploadCatImageIssueAccessTokenError from '../../../../../../mocks/api/lgtm/images/mockUploadCatImageIssueAccessTokenError';
import mockUploadCatImagePayloadTooLarge from '../../../../../../mocks/api/lgtm/images/mockUploadCatImagePayloadTooLarge';
import mockUploadCatImageUnprocessableEntity from '../../../../../../mocks/api/lgtm/images/mockUploadCatImageUnprocessableEntity';
import { uploadCatImage } from '../../imageRepository';

const mockHandlers = [
  rest.post(cognitoTokenEndpointUrl(), mockTokenEndpoint),
  rest.post(apiList.uploadCatImage, mockUploadCatImage),
];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
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

  it('should return an UploadCatImageAuthError because Failed to issueAccessToken', async () => {
    mockServer.use(
      rest.post(
        apiList.uploadCatImage,
        mockUploadCatImageIssueAccessTokenError,
      ),
    );

    const expected = new UploadCatImageAuthError();

    const request: UploadCatImageRequest = {
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });

  it('should return an UploadCatImageSizeTooLargeError because the size of the image is too large', async () => {
    mockServer.use(
      rest.post(apiList.uploadCatImage, mockUploadCatImagePayloadTooLarge),
    );

    const expected = new UploadCatImageSizeTooLargeError();

    const request: UploadCatImageRequest = {
      image: 'dummy large image',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });

  it('should return an UploadCatImageValidationError because image extensions are not allowed', async () => {
    mockServer.use(
      rest.post(apiList.uploadCatImage, mockUploadCatImageUnprocessableEntity),
    );

    const expected = new UploadCatImageValidationError();

    const request: UploadCatImageRequest = {
      image: 'dummy image',
      // 型定義によって間違えた型を渡す事が出来ないがMockで422を返すようになっているのでテストは意図した通りに動作する
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });

  it('should return an UploadCatImageUnexpectedError because the API will return unexpected error', async () => {
    mockServer.use(rest.post(apiList.uploadCatImage, mockInternalServerError));

    const expected = new UploadCatImageUnexpectedError();

    const request: UploadCatImageRequest = {
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await uploadCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });
});
