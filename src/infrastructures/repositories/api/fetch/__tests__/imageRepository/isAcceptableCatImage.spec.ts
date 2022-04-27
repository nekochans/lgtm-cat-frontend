/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { isAcceptableCatImageUrl } from '../../../../../../constants/url';
import IsAcceptableCatImageAuthError from '../../../../../../domain/errors/IsAcceptableCatImageAuthError';
import IsAcceptableCatImageError from '../../../../../../domain/errors/IsAcceptableCatImageError';
import {
  IsAcceptableCatImageNotAcceptableReason,
  IsAcceptableCatImageRequest,
} from '../../../../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockUnauthorizedError from '../../../../../../mocks/api/error/mockUnauthorizedError';
import mockIsAcceptableCatImage from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImage';
import mockIsAcceptableCatImageError from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImageError';
import mockIsAcceptableCatImageNotAllowedImageExtension from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImageNotAllowedImageExtension';
import mockIsAcceptableCatImageNotCatImage from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImageNotCatImage';
import mockIsAcceptableCatImageNotModerationImage from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImageNotModerationImage';
import mockIsAcceptableCatImagePersonFaceInImage from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImagePersonFaceInImage';
import { isAcceptableCatImage } from '../../imageRepository';

const mockHandlers = [
  rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('imageRepository.ts isAcceptableCatImage TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  it('should be true for isAcceptableCatImage', async () => {
    const expected = {
      isAcceptableCatImage: true,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: '',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should result in isAcceptableCatImage being false because not an allowed image extension', async () => {
    mockServer.use(
      rest.post(
        isAcceptableCatImageUrl(),
        mockIsAcceptableCatImageNotAllowedImageExtension,
      ),
    );

    const expected = {
      isAcceptableCatImage: false,
      notAcceptableReason:
        'not an allowed image extension' as IsAcceptableCatImageNotAcceptableReason,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should result in isAcceptableCatImage being false because not moderation image', async () => {
    mockServer.use(
      rest.post(
        isAcceptableCatImageUrl(),
        mockIsAcceptableCatImageNotModerationImage,
      ),
    );

    const expected = {
      isAcceptableCatImage: false,
      notAcceptableReason:
        'not moderation image' as IsAcceptableCatImageNotAcceptableReason,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should result in isAcceptableCatImage being false because person face in the image', async () => {
    mockServer.use(
      rest.post(
        isAcceptableCatImageUrl(),
        mockIsAcceptableCatImagePersonFaceInImage,
      ),
    );

    const expected = {
      isAcceptableCatImage: false,
      notAcceptableReason:
        'person face in the image' as IsAcceptableCatImageNotAcceptableReason,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should result in isAcceptableCatImage being false because not cat image', async () => {
    mockServer.use(
      rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImageNotCatImage),
    );

    const expected = {
      isAcceptableCatImage: false,
      notAcceptableReason:
        'not cat image' as IsAcceptableCatImageNotAcceptableReason,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should result in isAcceptableCatImage being false because an error has occurred', async () => {
    mockServer.use(
      rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImageError),
    );

    const expected = {
      isAcceptableCatImage: false,
      notAcceptableReason:
        'an error has occurred' as IsAcceptableCatImageNotAcceptableReason,
    };

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const isAcceptableCatImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
    expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
  });

  it('should return an IsAcceptableCatImageAuthError because the accessToken is invalid', async () => {
    mockServer.use(rest.post(isAcceptableCatImageUrl(), mockUnauthorizedError));

    const expected = new IsAcceptableCatImageAuthError();

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });

  it('should return an IsAcceptableCatImageError because the API will return internalServer error', async () => {
    mockServer.use(
      rest.post(isAcceptableCatImageUrl(), mockInternalServerError),
    );

    const expected = new IsAcceptableCatImageError();

    const request: IsAcceptableCatImageRequest = {
      accessToken: { jwtString: '' },
      image: 'dummy image',
      imageExtension: '.jpg',
    };

    const uploadedImageResult = await isAcceptableCatImage(request);

    expect(isSuccessResult(uploadedImageResult)).toBeFalsy();
    expect(uploadedImageResult.value).toStrictEqual(expected);
  });
});
