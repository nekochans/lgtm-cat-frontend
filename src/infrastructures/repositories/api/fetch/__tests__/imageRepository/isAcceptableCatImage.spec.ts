/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { isAcceptableCatImageUrl } from '../../../../../../constants/url';
import {
  IsAcceptableCatImageNotAcceptableReason,
  IsAcceptableCatImageRequest,
} from '../../../../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockIsAcceptableCatImage from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImage';
import mockIsAcceptableCatImageNotAllowedImageExtension from '../../../../../../mocks/api/external/recognition/mockIsAcceptableCatImageNotAllowedImageExtension';
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
});
