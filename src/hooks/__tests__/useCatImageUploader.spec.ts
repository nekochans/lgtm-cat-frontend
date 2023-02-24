/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  UploadCatImageError,
  uploadCatImageUrl,
  type AcceptedTypesImageExtension,
  type Language,
} from '../../features';
import {
  mockInternalServerError,
  mockUploadCatImage,
  mockUploadCatImagePayloadTooLarge,
  mockUploadCatImageUnprocessableEntity,
} from '../../mocks';
import { useCatImageUploader } from '../useCatImageUploader';

const mockHandlers = [rest.post(uploadCatImageUrl(), mockUploadCatImage)];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function, max-statements
describe('useCatImageUploader TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  const langJa = 'ja';

  const langEn = 'en';

  const dummyImage = 'dummy image';

  const dummyImageExtension = '.jpg';

  const dummySuccessResponse = {
    displayErrorMessages: [],
    createdLgtmImageUrl:
      'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
  };

  type TestTable = {
    language: Language;
    image: string;
    imageExtension: AcceptedTypesImageExtension;
    expected: typeof dummySuccessResponse | UploadCatImageError;
  };

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${dummySuccessResponse}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${dummySuccessResponse}
  `(
    'should return createdLgtmImageUrl. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageUploader } = useCatImageUploader(language);

      const imageUploadResult = await imageUploader(image, imageExtension);

      expect(imageUploadResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ displayErrorMessages: ['画像サイズが大きすぎます。', 'お手数ですが4MB以下の画像を利用して下さい。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ displayErrorMessages: ['Image size is too large.', 'Please use images under 4MB.'] }}
  `(
    'should return a list of error messages, because the image is too large. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageUploader } = useCatImageUploader(language);

      mockServer.use(
        rest.post(uploadCatImageUrl(), mockUploadCatImagePayloadTooLarge)
      );

      const imageUploadResult = await imageUploader(image, imageExtension);

      expect(imageUploadResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ displayErrorMessages: ['画像フォーマットが不正です。', 'お手数ですが別の画像を利用して下さい。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ displayErrorMessages: ['Invalid image format.', 'Sorry, please use another image.'] }}
  `(
    'should return a list of error messages, because the image file format is incorrect. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageUploader } = useCatImageUploader(language);

      mockServer.use(
        rest.post(uploadCatImageUrl(), mockUploadCatImageUnprocessableEntity)
      );

      const imageUploadResult = await imageUploader(image, imageExtension);

      expect(imageUploadResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${new UploadCatImageError('Internal Server Error')}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${new UploadCatImageError('Internal Server Error')}
  `(
    'should UploadCatImageError Throw, because an error has occurred. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageUploader } = useCatImageUploader(language);

      mockServer.use(rest.post(uploadCatImageUrl(), mockInternalServerError));

      await expect(imageUploader(image, imageExtension)).rejects.toStrictEqual(
        expected
      );
    }
  );
});
