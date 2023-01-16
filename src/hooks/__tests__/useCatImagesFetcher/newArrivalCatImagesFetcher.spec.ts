/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  fetchLgtmImagesInRecentlyCreatedUrl,
  FetchLgtmImagesError,
} from '../../../features';
import {
  mockInternalServerError,
  mockFetchLgtmImages,
  fetchLgtmImagesMockBody,
} from '../../../mocks';
import { useCatImagesFetcher } from '../../useCatImagesFetcher';

const mockHandlers = [
  rest.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockFetchLgtmImages),
];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('useCatImagesFetcher.ts newArrivalCatImagesFetcher TestCases', () => {
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

    const lgtmImages = await useCatImagesFetcher().newArrivalCatImagesFetcher();

    expect(lgtmImages).toStrictEqual(expected);
  });

  it('should FetchLgtmImagesError Throw, because Failed to fetch LGTM Images', async () => {
    mockServer.use(
      rest.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError)
    );

    await expect(
      useCatImagesFetcher().newArrivalCatImagesFetcher()
    ).rejects.toStrictEqual(new FetchLgtmImagesError('Internal Server Error'));
  });
});
