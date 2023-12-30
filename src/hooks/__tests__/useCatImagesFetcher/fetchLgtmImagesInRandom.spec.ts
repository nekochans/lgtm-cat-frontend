/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { FetchLgtmImagesError, fetchLgtmImagesUrl } from '@/features';
import { useCatImagesFetcher } from '@/hooks/useCatImagesFetcher';
import {
  fetchLgtmImagesMockBody,
  mockFetchLgtmImages,
  mockInternalServerError,
} from '@/mocks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockHandlers = [rest.get(fetchLgtmImagesUrl(), mockFetchLgtmImages)];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('useCatImagesFetcher.ts randomCatImagesFetcher TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  it('should be able to fetch LGTM Images', async () => {
    const expected = fetchLgtmImagesMockBody.lgtmImages.map((value) => ({
      id: value.id,
      imageUrl: value.imageUrl,
    }));

    const lgtmImages = await useCatImagesFetcher().randomCatImagesFetcher();

    expect(lgtmImages).toStrictEqual(expected);
  });

  it('should FetchLgtmImagesError Throw, because Failed to fetch LGTM Images', async () => {
    mockServer.use(rest.get(fetchLgtmImagesUrl(), mockInternalServerError));

    await expect(
      useCatImagesFetcher().randomCatImagesFetcher(),
    ).rejects.toStrictEqual(new FetchLgtmImagesError('Internal Server Error'));
  });
});
