import fetchMock from 'fetch-mock-jest';
import { fetchLgtmImagesInRandomWithClient } from '../../imageRepository';
import FetchLgtmImagesInRandomError from '../../../../../../domain/errors/FetchLgtmImagesInRandomError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import { apiList } from '../../../../../../constants/url';

describe('imageRepository.ts fetchLgtmImagesInRandomWithClient TestCases', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('should be able to fetch LGTM Images', async () => {
    const mockBody = {
      lgtmImages: [
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

    fetchMock.get(apiList.fetchLgtmImages, { status: 200, body: mockBody });

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    expect(isSuccessResult(lgtmImagesResponse)).toBeTruthy();
    expect(lgtmImagesResponse.value).toStrictEqual(mockBody);
  });

  it('should return an Error because the HTTP status is not 200', async () => {
    const mockBody = { message: 'Internal Server Error' };

    fetchMock.get(apiList.fetchLgtmImages, { status: 500, body: mockBody });

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomError(),
    );
  });
});
