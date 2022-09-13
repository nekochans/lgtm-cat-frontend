/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { FetchLgtmImagesError } from '../../../features/errors/FetchLgtmImagesError';
import { IssueAccessTokenError } from '../../../features/errors/IssueAccessTokenError';
import {
  apiList,
  appBaseUrl,
  fetchLgtmImagesInRecentlyCreatedUrl,
} from '../../../features/url';
import { mockInternalServerError } from '../../../mocks/api/error/mockInternalServerError';
import { mockTokenEndpoint } from '../../../mocks/api/external/cognito/mockTokenEndpoint';
import { mockFetchLgtmImages } from '../../../mocks/api/external/lgtmeow/mockFetchLgtmImages';
import { fetchLgtmImagesMockBody } from '../../../mocks/api/fetchLgtmImagesMockBody';
import { useCatImagesFetcher } from '../../useCatImagesFetcher';

const mockHandlers = [
  rest.post(
    `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
    mockTokenEndpoint,
  ),
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
      imageUrl: value.url,
    }));

    const lgtmImages = await useCatImagesFetcher().newArrivalCatImagesFetcher();

    expect(lgtmImages).toStrictEqual(expected);
  });

  it('should IssueAccessTokenError Throw, because accessToken issuance failed', async () => {
    mockServer.use(
      rest.post(
        `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
        mockInternalServerError,
      ),
    );

    await expect(
      useCatImagesFetcher().newArrivalCatImagesFetcher(),
    ).rejects.toStrictEqual(new IssueAccessTokenError('Internal Server Error'));
  });

  it('should FetchLgtmImagesError Throw, because Failed to fetch LGTM Images', async () => {
    mockServer.use(
      rest.post(
        `${appBaseUrl()}${apiList.issueClientCredentialsAccessToken}`,
        mockTokenEndpoint,
      ),
      rest.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError),
    );

    await expect(
      useCatImagesFetcher().newArrivalCatImagesFetcher(),
    ).rejects.toStrictEqual(new FetchLgtmImagesError('Internal Server Error'));
  });
});
