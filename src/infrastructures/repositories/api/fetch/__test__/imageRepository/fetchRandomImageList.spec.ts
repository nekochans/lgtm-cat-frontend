// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'jest-fetch-mock';
import { fetchRandomImageList } from '../../imageRepository';
import FetchRandomImageListError from '../../../../../../domain/errors/FetchRandomImageListError';

describe('imageRepository.ts fetchRandomImageList TestCases', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should be able to fetch random image list', async () => {
    const mockBody = {
      images: [
        {
          id: 5,
          url: '/cat.jpeg',
        },
        {
          id: 2,
          url: '/cat2.jpeg',
        },
        {
          id: 4,
          url: '/cat2.jpeg',
        },
        {
          id: 12,
          url: '/cat2.jpeg',
        },
        {
          id: 10,
          url: '/cat2.jpeg',
        },
        {
          id: 3,
          url: '/cat.jpeg',
        },
        {
          id: 11,
          url: '/cat2.jpeg',
        },
        {
          id: 6,
          url: '/cat.jpeg',
        },
        {
          id: 7,
          url: '/cat2.jpeg',
        },
      ],
    };

    const mockParams = {
      status: 200,
      statusText: 'OK',
    };

    fetch.mockResponseOnce(JSON.stringify(mockBody), mockParams);

    const jwkList = await fetchRandomImageList();

    expect(jwkList).toStrictEqual(mockBody);
  });

  it('should return an Error because the HTTP status is not 200', async () => {
    const mockBody = { message: 'Internal Server Error' };

    const mockParams = {
      status: 500,
      statusText: 'Internal Server Error',
    };

    fetch.mockResponseOnce(JSON.stringify(mockBody), mockParams);

    const jwkListPromise = fetchRandomImageList();

    await expect(jwkListPromise).rejects.toThrowError(
      FetchRandomImageListError,
    );
  });
});
