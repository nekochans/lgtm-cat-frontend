/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  IsAcceptableCatImageError,
  isSuccessResult,
  isAcceptableCatImageUrl,
  type AcceptedTypesImageExtension,
  type Language,
} from '../../features';
import {
  mockInternalServerError,
  mockIsAcceptableCatImage,
  mockIsAcceptableCatImageError,
  mockIsAcceptableCatImageNotAllowedImageExtension,
  mockIsAcceptableCatImageNotCatImage,
  mockIsAcceptableCatImageNotModerationImage,
  mockIsAcceptableCatImagePayloadTooLargeError,
  mockIsAcceptableCatImagePersonFaceInImage,
} from '../../mocks';
import { useCatImageValidator } from '../useCatImageValidator';

const mockHandlers = [
  rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImage),
];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function, max-statements
describe('useCatImageValidator TestCases', () => {
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

  type TestTable = {
    language: Language;
    image: string;
    imageExtension: AcceptedTypesImageExtension;
    expected:
      | { isAcceptableCatImage: boolean; notAcceptableReason: string[] }
      | Error;
  };

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: true, notAcceptableReason: [] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: true, notAcceptableReason: [] }}
  `(
    'should be true for isAcceptableCatImage. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['png, jpg, jpeg の画像のみアップロード出来ます。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['Sorry, only png, jpg, jpeg images can be uploaded.'] }}
  `(
    'should result in isAcceptableCatImage being false, because not an allowed image extension. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotAllowedImageExtension
        )
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['この画像は不適切なものが写っているので利用出来ません。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['Sorry, This image is not available because it shows something inappropriate.'] }}
  `(
    'should result in isAcceptableCatImage being false, because not moderation image. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotModerationImage
        )
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['申し訳ありませんが人の顔が写っていない画像をご利用ください。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ["Sorry, please use images that do not show people's faces."] }}
  `(
    'should result in isAcceptableCatImage being false, because person face in the image. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImagePersonFaceInImage
        )
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['申し訳ありませんがはっきりと猫が写っている画像をご利用ください。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['Sorry, but please use images that clearly show the cat.'] }}
  `(
    'should result in isAcceptableCatImage being false, because not cat image. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImageNotCatImage
        )
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['画像サイズが大きすぎます。', 'お手数ですが4MB以下の画像を利用して下さい。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['Image size is too large.', 'Please use images under 4MB.'] }}
  `(
    'should result in isAcceptableCatImage being false, because the image is too large. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(
          isAcceptableCatImageUrl(),
          mockIsAcceptableCatImagePayloadTooLargeError
        )
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['予期せぬエラーが発生しました。', 'お手数ですが、しばらく時間が経ってからお試し下さい。'] }}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${{ isAcceptableCatImage: false, notAcceptableReason: ['An unexpected Error occurred.', 'Sorry, please try again after some time has passed.'] }}
  `(
    'should result in isAcceptableCatImage being false, because an error has occurred. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(isAcceptableCatImageUrl(), mockIsAcceptableCatImageError)
      );

      const isAcceptableCatImageResult = await imageValidator(
        image,
        imageExtension
      );

      expect(isSuccessResult(isAcceptableCatImageResult)).toBeTruthy();
      expect(isAcceptableCatImageResult.value).toStrictEqual(expected);
    }
  );

  it.each`
    language  | image         | imageExtension         | expected
    ${langJa} | ${dummyImage} | ${dummyImageExtension} | ${new IsAcceptableCatImageError('Internal Server Error')}
    ${langEn} | ${dummyImage} | ${dummyImageExtension} | ${new IsAcceptableCatImageError('Internal Server Error')}
  `(
    'should return an IsAcceptableCatImageError, because the API will return internalServer error. language: $language',
    async ({ language, image, imageExtension, expected }: TestTable) => {
      const { imageValidator } = useCatImageValidator(language);

      mockServer.use(
        rest.post(isAcceptableCatImageUrl(), mockInternalServerError)
      );

      await expect(imageValidator(image, imageExtension)).rejects.toStrictEqual(
        expected
      );
    }
  );
});
