/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { apiList } from '../../../../../../constants/url';
import FetchLgtmImagesInRandomError from '../../../../../../domain/errors/FetchLgtmImagesInRandomError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockFetchLgtmImages from '../../../../../../mocks/api/external/lgtmeow/mockFetchLgtmImages';
import fetchLgtmImagesMockBody from '../../../../../../mocks/api/fetchLgtmImagesMockBody';
import { fetchLgtmImagesInRandomWithClient } from '../../imageRepository';

const mockHandlers = [rest.get(apiList.fetchLgtmImages, mockFetchLgtmImages)];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('imageRepository.ts fetchLgtmImagesInRandomWithClient TestCases', () => {
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
    const expected = fetchLgtmImagesMockBody;

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    expect(isSuccessResult(lgtmImagesResponse)).toBeTruthy();
    expect(lgtmImagesResponse.value).toStrictEqual(expected);
  });

  it('should return an Error because the HTTP status is not 200', async () => {
    mockServer.use(rest.get(apiList.fetchLgtmImages, mockInternalServerError));

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithClient();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomError(),
    );
  });
});
