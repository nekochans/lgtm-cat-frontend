import {
  appBaseUrl,
  FetchLgtmImagesError,
  fetchLgtmImagesInRecentlyCreatedUrl,
} from '@/features';
import { useCatImagesFetcher } from '@/hooks/useCatImagesFetcher';
import {
  fetchLgtmImagesMockBody,
  mockFetchLgtmImages,
  mockInternalServerError,
} from '@/mocks';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const mockHandlers = [
  http.get(
    fetchLgtmImagesInRecentlyCreatedUrl(appBaseUrl()),
    mockFetchLgtmImages,
  ),
];

const server = setupServer(...mockHandlers);

describe('useCatImagesFetcher.ts newArrivalCatImagesFetcher TestCases', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should be able to fetch LGTM Images', async () => {
    const expected = fetchLgtmImagesMockBody.lgtmImages.map((value) => ({
      id: value.id,
      imageUrl: value.imageUrl,
    }));

    const lgtmImages =
      await useCatImagesFetcher(appBaseUrl()).newArrivalCatImagesFetcher(
        appBaseUrl(),
      );

    expect(lgtmImages).toStrictEqual(expected);
  });

  it('should FetchLgtmImagesError Throw, because Failed to fetch LGTM Images', async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError),
    );

    await expect(
      useCatImagesFetcher(appBaseUrl()).newArrivalCatImagesFetcher(
        appBaseUrl(),
      ),
    ).rejects.toStrictEqual(new FetchLgtmImagesError('Internal Server Error'));
  });
});
